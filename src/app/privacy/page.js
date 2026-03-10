import styles from '../terms/terms.module.css';

export const metadata = {
  title: '개인정보처리방침 | M-DEENO',
  description: 'M-DEENO 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>개인정보처리방침</h1>
        <p className={styles.updated}>시행일: 2026년 3월 10일</p>

        <section className={styles.section}>
          <h2>제1조 (개인정보의 처리 목적)</h2>
          <p>
            M-DEENO(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며,
            이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.
          </p>
          <ul>
            <li>서비스 제공: 분담금 시뮬레이션 결과 및 리포트 전달</li>
            <li>회원 관리: 사전 신청자 관리 및 베타 서비스 안내</li>
            <li>마케팅·광고: 서비스 출시 및 업데이트 이메일 발송 (동의 시)</li>
            <li>서비스 개선: 이용 통계 분석 및 기능 개선</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제2조 (처리하는 개인정보 항목)</h2>
          <p>회사는 다음과 같은 개인정보를 처리합니다.</p>
          <ul>
            <li><strong>필수:</strong> 이메일 주소</li>
            <li><strong>선택 (시뮬레이터 입력):</strong> 단지명, 전용면적, 권리가액, 공사비 등 정비사업 관련 수치 정보</li>
            <li><strong>자동 수집:</strong> IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
          </ul>
          <p>
            시뮬레이터 입력 정보는 특정 개인을 식별하기 어려운 수치 데이터이나,
            이메일과 결합될 경우 개인정보로서 보호됩니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제3조 (개인정보의 처리 및 보유 기간)</h2>
          <ul>
            <li>이메일 주소: 수신 거부 또는 회원 탈퇴 시까지</li>
            <li>결제 정보: 전자상거래법에 따라 5년간 보관</li>
            <li>서비스 이용 기록: 3개월</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <p>
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            단, 다음의 경우에는 예외로 합니다.
          </p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의거하거나 수사 목적으로 관계 기관이 요구하는 경우</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제5조 (개인정보 처리 위탁)</h2>
          <p>회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>수탁업체</th>
                <th>위탁 업무</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase Inc.</td>
                <td>데이터베이스 저장 및 관리</td>
              </tr>
              <tr>
                <td>Resend Inc.</td>
                <td>이메일 발송 서비스</td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>서비스 호스팅 및 운영</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>제6조 (정보주체의 권리·의무)</h2>
          <p>이용자는 회사에 대해 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요구</li>
            <li>오류 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
          </ul>
          <p>
            권리 행사는 이메일(<a href="mailto:mdeeno.official@gmail.com">mdeeno.official@gmail.com</a>)로 요청하실 수 있으며,
            회사는 지체 없이 조치하겠습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제7조 (쿠키의 운용)</h2>
          <p>
            회사는 서비스 이용 분석을 위해 Google Analytics(GA4) 쿠키를 사용합니다.
            쿠키는 브라우저 설정을 통해 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다.</p>
          <ul>
            <li>전송 구간 암호화(HTTPS/TLS)</li>
            <li>데이터베이스 접근 권한 최소화(Row Level Security)</li>
            <li>Service Role Key 등 민감 키의 서버 전용 관리</li>
            <li>정기적인 보안 점검</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제9조 (이메일 수신 거부)</h2>
          <p>
            회사에서 발송하는 이메일의 수신을 원하지 않으실 경우,
            이메일에 "수신거부"라고 회신하시거나
            <a href="mailto:mdeeno.official@gmail.com"> mdeeno.official@gmail.com</a>으로
            수신 거부 의사를 보내주시면 즉시 처리합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제10조 (개인정보 보호책임자)</h2>
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄하고, 관련 불만 처리 및 피해 구제를 위해
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <ul>
            <li>책임자: M-DEENO 운영팀</li>
            <li>이메일: <a href="mailto:mdeeno.official@gmail.com">mdeeno.official@gmail.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
