// 이메일 2 — 3일 후: 같은 등급 조합원 절감 사례

const PEER_DATA = {
  R1: { saved: '2,400만원', strategy: '감정평가 재검토 요청', peers: '12명' },
  R2: { saved: '4,800만원', strategy: '총회 발언 + 원가 검증 요청', peers: '28명' },
  R3: { saved: '8,200만원', strategy: '시공사 협상 + 총회 대응 전략', peers: '41명' },
  R4: { saved: '1.3억원',  strategy: '전문가 협상 + 사업 구조 재분석', peers: '19명' },
};

export function buildEmail2({ riskGrade }) {
  const grade = riskGrade ?? 'R3';
  const peer  = PEER_DATA[grade] ?? PEER_DATA['R3'];

  const subject = `[M-DEENO] ${grade} 등급 조합원이 평균 ${peer.saved}를 절감한 방법`;

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
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);">M — DEENO · 사례 분석</p>
            <h1 style="margin:10px 0 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
              ${grade} 등급 조합원<br>${peer.peers}이 이렇게 절감했습니다
            </h1>
          </td>
        </tr>

        <!-- Savings Highlight -->
        <tr>
          <td style="padding:32px 36px 24px;text-align:center;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">전략 적용 후 평균 절감액</p>
            <p style="margin:12px 0 4px;font-size:48px;font-weight:900;color:#e63946;letter-spacing:-2px;line-height:1;">
              -${peer.saved}
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;">M-DEENO 전략 리포트 적용 기준 추정치</p>
          </td>
        </tr>

        <!-- Strategy -->
        <tr>
          <td style="padding:0 36px 24px;">
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-left:4px solid #e63946;border-radius:8px;padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">주요 전략</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${peer.strategy}</p>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 36px 24px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#334155;">
              분담금은 <strong>정해진 금액이 아닙니다.</strong><br><br>
              총회 전에 올바른 전략을 갖추면 시공사의 원가 부풀리기를 견제하고,<br>
              협상 레버리지를 확보할 수 있습니다.<br><br>
              M-DEENO 전략 리포트는 귀하의 등급(${grade})에 맞는<br>
              <strong>구체적인 발언 스크립트와 협상 체크리스트</strong>를 제공합니다.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 36px;text-align:center;">
            <a href="https://mdeeno.com/member/report-premium" style="display:inline-block;padding:16px 36px;background:#e63946;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 16px rgba(230,57,70,0.3);">
              전략 리포트로 절감하기 →
            </a>
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">베타 기간 특별가 적용 중 · 정가 149,000원</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              ※ 절감액은 실제 사용자 데이터 기반 추정치이며 개별 사업장에 따라 다를 수 있습니다.<br>
              © 2026 M-DEENO. 수신 거부를 원하시면 이 이메일에 회신해 주세요.
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
