// 이메일 3 — 7일 후: 총회 전 마지막 기회 + 할인 코드

export const DISCOUNT_CODE = 'EARLY10';
export const DISCOUNT_PCT  = 10;

export function buildEmail3({ riskGrade }) {
  const grade = riskGrade ?? 'R3';

  const subject = `[M-DEENO] 마지막 안내 — 10% 할인 코드가 48시간 후 만료됩니다`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header (dark red = urgency) -->
        <tr>
          <td style="background:#7f1d1d;padding:28px 36px;">
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.5);">M — DEENO · 마지막 안내</p>
            <h1 style="margin:10px 0 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
              총회 전에 전략을<br>갖추셨나요?
            </h1>
          </td>
        </tr>

        <!-- Discount Code -->
        <tr>
          <td style="padding:32px 36px 24px;text-align:center;">
            <p style="margin:0 0 14px;font-size:14px;color:#475569;">사전 신청자 전용 ${DISCOUNT_PCT}% 할인 코드</p>
            <div style="display:inline-block;padding:16px 32px;background:#0f172a;border-radius:10px;border:2px dashed #e63946;">
              <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:4px;">${DISCOUNT_CODE}</p>
            </div>
            <p style="margin:12px 0 0;font-size:12px;color:#e63946;font-weight:700;">48시간 후 만료</p>
          </td>
        </tr>

        <!-- Checklist -->
        <tr>
          <td style="padding:0 36px 24px;">
            <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0f172a;">총회 전 반드시 확인해야 할 3가지</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0;font-size:14px;color:#334155;">
                    <span style="color:#e63946;font-weight:900;margin-right:8px;">✗</span>
                    시공사 제시 공사비 원가 검증 — <strong>아직 안 하셨나요?</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0;font-size:14px;color:#334155;">
                    <span style="color:#e63946;font-weight:900;margin-right:8px;">✗</span>
                    총회 발언 준비 — <strong>어떤 질문을 해야 할지 아시나요?</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <p style="margin:0;font-size:14px;color:#334155;">
                    <span style="color:#e63946;font-weight:900;margin-right:8px;">✗</span>
                    분담금 구조 분석 — <strong>${grade} 등급의 협상 레버리지를 파악하셨나요?</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 36px 24px;">
            <div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#7f1d1d;">
                총회에서 한 번 찬성 투표하면 <strong>수억원의 분담금이 확정됩니다.</strong><br>
                취소할 수 없습니다.
              </p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 36px;text-align:center;">
            <a href="https://mdeeno.com/member/report-premium" style="display:inline-block;padding:16px 36px;background:#1e40af;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 16px rgba(30,64,175,0.3);">
              할인 코드 적용하고 리포트 받기 →
            </a>
            <p style="margin:12px 0 0;font-size:13px;color:#64748b;">
              결제 시 코드 <strong>${DISCOUNT_CODE}</strong> 입력 → ${DISCOUNT_PCT}% 즉시 할인
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              본 이메일은 M-DEENO 베타 신청자에게 발송됩니다. 이 메일이 마지막 안내입니다.<br>
              수신 거부: 이 이메일에 "수신거부" 라고 회신해 주세요.<br>
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
