/**
 * GET /api/orders/[orderId]/download
 * 결제 완료된 주문의 PDF를 즉시 생성하여 다운로드
 *
 * Auth: orderId가 토큰 역할 (mdeeno_YYYYMMDD_XXXXXXXXXX, 추측 불가)
 */

import { NextResponse }       from 'next/server';
import { getOrderById }       from '@/lib/orders';
import { fetchPdfFromBackend } from '@/lib/backend';
import { isValidOrderId }     from '@/lib/security';

export const maxDuration = 120; // Vercel 함수 최대 실행 시간 (초)

const FILE_NAMES = {
  premium:      'M-DEENO_프리미엄전략리포트.pdf',
  basic:        'M-DEENO_기본리포트.pdf',
  premium_beta: 'M-DEENO_프리미엄전략리포트.pdf',
  basic_beta:   'M-DEENO_기본리포트.pdf',
};

const ENDPOINTS = {
  premium:      '/v1/member-premium-report',
  basic:        '/v1/member-basic-report',
  premium_beta: '/v1/member-premium-report',
  basic_beta:   '/v1/member-basic-report',
};

export async function GET(_req, { params }) {
  const { orderId } = await params;

  if (!isValidOrderId(orderId)) {
    return NextResponse.json({ error: '유효하지 않은 주문 ID입니다' }, { status: 400 });
  }

  let order;
  try {
    order = await getOrderById(orderId);
  } catch {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: '결제가 완료된 주문이 아닙니다' }, { status: 403 });
  }

  const endpoint = ENDPOINTS[order.product_type] ?? '/v1/member-basic-report';
  const fileName = FILE_NAMES[order.product_type]  ?? 'M-DEENO_리포트.pdf';

  const pdfPayload = {
    asset_value:    order.asset_value        ?? 5,
    expected_extra: order.expected_extra     ?? 1,
    member_name:    order.member_name        ?? '조합원',
    complex_name:   order.complex_name       ?? '',
    location:       order.location           ?? '해당 지역',
    cost:           order.construction_cost  ?? 900,
    email:          order.email,
  };

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mdeeno.com';

  let buffer;
  try {
    const result = await fetchPdfFromBackend(endpoint, pdfPayload, origin);
    buffer = result.buffer;
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? 'PDF 생성에 실패했습니다. 이메일로 발송된 리포트를 확인해 주세요.' },
      { status: err.status ?? 500 },
    );
  }

  const encodedName = encodeURIComponent(fileName);
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
    },
  });
}
