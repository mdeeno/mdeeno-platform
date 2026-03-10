// 이메일 1 — 즉시 발송: 분석 결과 요약 + 리포트 미리보기

const RISK_LABEL = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };
const RISK_COLOR = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };

export function buildEmail1({ email, riskGrade, assetValue, expectedExtra }) {
  const grade = riskGrade ?? 'R3';
  const label = RISK_LABEL[grade] ?? '분석 완료';
  const color = RISK_COLOR[grade] ?? '#e63946';

  const assetText  = assetValue  ? `${assetValue}억원` : '—';
  const extraText  = expectedExtra ? `${expectedExtra}억원` : '—';

  const subject = `[M-DEENO] 귀하의 재건축 분담금 위험 등급은 ${grade}입니다`;

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
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);">M — DEENO · Prop-Logic™</p>
            <h1 style="margin:10px 0 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
              재건축 분담금 분석이<br>완료되었습니다
            </h1>
          </td>
        </tr>

        <!-- Risk Badge -->
        <tr>
          <td style="padding:32px 36px 0;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">위험 등급</p>
            <div style="display:inline-block;padding:8px 20px;background:${color};color:#ffffff;font-size:20px;font-weight:900;border-radius:6px;letter-spacing:1px;">
              ${grade} — ${label}
            </div>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:24px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:10px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <td style="padding:14px 20px;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">종전자산</p>
                  <p style="margin:6px 0 0;font-size:18px;font-weight:900;color:#0f172a;">${assetText}</p>
                </td>
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">예상 추가 분담금</p>
                  <p style="margin:6px 0 0;font-size:18px;font-weight:900;color:#e63946;">${extraText}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 36px 24px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#334155;">
              공사비가 <strong>5%만 상승해도</strong> 귀하의 추가 분담금은 크게 늘어날 수 있습니다.<br><br>
              M-DEENO 전략 리포트는 공사비 시나리오별 분담금 구조를 분석하고,<br>
              <strong>총회에서 실제로 쓸 수 있는 협상 전략과 발언 스크립트</strong>까지 제공합니다.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 36px;text-align:center;">
            <a href="https://mdeeno.com/member/report-premium" style="display:inline-block;padding:16px 36px;background:#1e40af;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 16px rgba(30,64,175,0.3);">
              전략 리포트 확인하기 →
            </a>
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">베타 기간 특별가 적용 중</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              본 이메일은 M-DEENO 베타 신청 시 제공하신 이메일 주소로 발송되었습니다.<br>
              © 2026 M-DEENO. 서울특별시
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
