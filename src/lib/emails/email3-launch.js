// 이메일 3 — 6/15 결제 오픈 당일: 사전 신청자 베타 특가 안내

export function buildEmail3Launch({ riskGrade }) {
  const grade = riskGrade ?? 'R3';

  const subject = '[M-DEENO] 오늘부터 결제 가능합니다 — 사전 신청자 베타 특가 안내';

  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:28px 36px;">
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);">M — DEENO · 정식 출시</p>
            <h1 style="margin:10px 0 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
              오늘부터 리포트를<br>받아보실 수 있습니다
            </h1>
          </td>
        </tr>

        <!-- Badge -->
        <tr>
          <td style="padding:32px 36px 0;text-align:center;">
            <div style="display:inline-block;padding:8px 20px;background:#dcfce7;color:#15803d;font-size:14px;font-weight:800;border-radius:6px;">
              사전 신청자 베타 특가 적용 중
            </div>
          </td>
        </tr>

        <!-- Pricing -->
        <tr>
          <td style="padding:24px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:10px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <td style="padding:18px 24px;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">기본 리포트</p>
                  <p style="margin:8px 0 2px;font-size:22px;font-weight:900;color:#0f172a;">29,000원</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;text-decoration:line-through;">정가 39,000원</p>
                </td>
                <td style="padding:18px 24px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">프리미엄 전략 리포트</p>
                  <p style="margin:8px 0 2px;font-size:22px;font-weight:900;color:#e63946;">99,000원</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;text-decoration:line-through;">정가 149,000원</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 36px 24px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#334155;">
              사전 신청해 주셔서 감사합니다.<br><br>
              귀하의 위험 등급 <strong>${grade}</strong>에 맞는 전략 리포트가 준비되어 있습니다.<br>
              총회 전에 협상 전략과 발언 스크립트를 갖추세요.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 36px;text-align:center;">
            <a href="https://mdeeno.com/member/report-premium" style="display:inline-block;padding:16px 36px;background:#e63946;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 16px rgba(230,57,70,0.3);">
              베타 특가로 리포트 받기 →
            </a>
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">베타 특가는 한정 기간만 적용됩니다</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              본 이메일은 M-DEENO 베타 신청자에게 발송됩니다.<br>
              수신 거부: 이 이메일에 "수신거부"라고 회신해 주세요.<br>
              © 2026 M-DEENO.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
