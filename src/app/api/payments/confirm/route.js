/**
 * POST /api/payments/confirm
 * 결제 최종 확인: Toss 승인 → DB 업데이트 → PDF 생성 + 이메일 발송 (after)
 */

import { NextResponse, after } from 'next/server';
import { createClient }        from '@supabase/supabase-js';
import { confirmTossPayment }  from '@/lib/toss';
import { getOrderById, updateOrderStatus, markOrderDelivered } from '@/lib/orders';
import { fetchPdfFromBackend } from '@/lib/backend';
import { resend, FROM }        from '@/lib/resend';
import { buildEmail1 }         from '@/lib/emails/email1-welcome';
import { isValidOrderId, getClientIp } from '@/lib/security';
import { writeAuditLog, AUDIT_EVENT }  from '@/lib/auditLog';

export async function POST(req) {
  const clientIp = getClientIp(req);

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: '요청 형식이 올바르지 않습니다' }, { status: 400 }); }

  const { paymentKey, orderId, amount } = body;

  if (!paymentKey || !orderId || typeof amount !== 'number') {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다' }, { status: 400 });
  }

  // orderId 형식 검증 (mdeeno_YYYYMMDD_XXXXXXXXXX)
  if (!isValidOrderId(orderId)) {
    return NextResponse.json({ error: '유효하지 않은 주문 ID입니다' }, { status: 400 });
  }

  // ── 1. DB에서 주문 조회 ───────────────────────────────────────────────────
  let order;
  try {
    order = await getOrderById(orderId);
  } catch {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
  }

  // 멱등성: 이미 결제 완료된 주문
  if (order.status === 'paid') {
    return NextResponse.json({ success: true, orderId });
  }

  // ── 2. 금액 위변조 검증 ───────────────────────────────────────────────────
  if (order.amount !== amount) {
    console.error(`amount mismatch: DB=${order.amount}, request=${amount}, orderId=${orderId}`);
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
  }

  // ── 3. Toss 결제 승인 ─────────────────────────────────────────────────────
  let tossData;
  try {
    tossData = await confirmTossPayment({ paymentKey, orderId, amount });
  } catch (err) {
    console.error('Toss confirm error:', err);
    await updateOrderStatus(orderId, 'failed').catch(() => {});
    await writeAuditLog({
      eventType : AUDIT_EVENT.PAYMENT_FAILED,
      orderId,
      email     : order.email,
      ipAddress : clientIp,
      metadata  : { reason: err.message ?? '결제 승인 실패', tossStatus: err.status },
    });
    return NextResponse.json(
      { error: err.message ?? '결제 승인에 실패했습니다' },
      { status: err.status ?? 500 },
    );
  }

  // ── 4. DB 상태 → paid ─────────────────────────────────────────────────────
  try {
    await updateOrderStatus(orderId, 'paid', {
      paymentKey: tossData.paymentKey,
      method:     tossData.method,
      approvedAt: tossData.approvedAt,
    });
  } catch (err) {
    console.error('orders update error:', err.message);
    // 결제는 됐으므로 에러 반환하지 않음
  }

  await writeAuditLog({
    eventType : AUDIT_EVENT.PAYMENT_CONFIRMED,
    orderId,
    email     : order.email,
    ipAddress : clientIp,
    metadata  : { productType: order.product_type, amount: order.amount },
  });

  // ── 5. PDF 생성 + 이메일 (after — 응답 후 백그라운드 처리) ────────────────
  after(async () => {
    try {
      const endpoint    = order.product_type === 'premium'
        ? '/v1/member-premium-report'
        : '/v1/member-basic-report';
      const pdfPayload  = {
        asset_value:    order.asset_value    ?? 5,
        expected_extra: order.expected_extra ?? 1,
        member_name:    order.member_name    ?? '조합원',
        complex_name:   order.complex_name   ?? '',
        location:       order.location       ?? '해당 지역',
        cost:           order.construction_cost ?? 900,
        email:          order.email,
      };

      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mdeeno.com';
      const { buffer, reportId } = await fetchPdfFromBackend(endpoint, pdfPayload, origin);

      // 이메일 발송 (PDF 첨부)
      const fileName = order.product_type === 'premium'
        ? 'M-DEENO_프리미엄전략리포트.pdf'
        : 'M-DEENO_기본리포트.pdf';

      const { subject } = buildEmail1({
        email:         order.email,
        riskGrade:     order.risk_grade,
        assetValue:    order.asset_value,
        expectedExtra: order.expected_extra,
      });

      await resend.emails.send({
        from:        FROM,
        to:          order.email,
        subject:     `[M-DEENO] 구매하신 리포트가 준비되었습니다`,
        html:        buildReportReadyHtml({ order, fileName }),
        attachments: [{
          filename: fileName,
          content:  Buffer.from(buffer).toString('base64'),
        }],
      });

      await markOrderDelivered(orderId, { reportId });
      await writeAuditLog({
        eventType : AUDIT_EVENT.PDF_GENERATED,
        orderId,
        email     : order.email,
        metadata  : { reportId, productType: order.product_type },
      });

      // report_records 저장 — 공유 링크 페이지(/report/[report_id]) 에서 조회
      if (reportId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        );
        await supabase.from('report_records').insert([{
          report_id:              reportId,
          risk_level:             order.risk_grade     ?? null,
          expected_contribution:  order.expected_extra ?? null,
          comparison_contribution: null, // 백엔드 고도화 시 추가
          shock_score:            null,  // 백엔드 고도화 시 추가
          complex_name:           order.complex_name   ?? null,
          location:               order.location       ?? null,
        }]);
      }
    } catch (err) {
      console.error(`PDF/email failed for order ${orderId}:`, err?.message ?? err);
      await writeAuditLog({
        eventType : AUDIT_EVENT.PDF_FAILED,
        orderId,
        email     : order.email,
        metadata  : { reason: err?.message ?? 'PDF 생성 실패' },
      });
      // pdf_generated, email_sent = false 유지 → 어드민 재발송 가능
    }
  });

  return NextResponse.json({ success: true, orderId });
}

function buildReportReadyHtml({ order, fileName }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0f2d6b;padding:32px;text-align:center;">
          <p style="color:#93c5fd;font-size:12px;margin:0 0 8px;">M-DEENO Prop-Logic™</p>
          <h1 style="color:#ffffff;font-size:22px;margin:0;">리포트가 준비되었습니다</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 16px;">
            안녕하세요. 구매하신 <strong>${fileName.replace('.pdf', '')}</strong>를 첨부 파일로 보내드립니다.
          </p>
          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">
            첨부된 PDF를 저장하여 확인하세요.<br>
            문의사항은 support@mdeeno.com으로 연락해 주세요.
          </p>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            ※ 본 리포트는 참고용 분석 자료이며 법적 효력이 없습니다.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
