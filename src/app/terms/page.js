import styles from './terms.module.css';

export const metadata = {
  title: '이용약관 | M-DEENO',
  description: 'M-DEENO 서비스 이용약관입니다.',
};

export default function TermsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>이용약관</h1>
        <p className={styles.updated}>시행일: 2026년 3월 10일</p>

        <section className={styles.section}>
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 M-DEENO(이하 "회사")가 제공하는 정비사업 분담금 리스크 분석 서비스(이하 "서비스")의
            이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제2조 (정의)</h2>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ul>
            <li>"서비스"란 회사가 제공하는 재건축·재개발 정비사업 분담금 리스크 분석 및 전략 리포트 생성 서비스를 말합니다.</li>
            <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 개인을 말합니다.</li>
            <li>"리포트"란 이용자가 입력한 정보를 바탕으로 회사의 M-DEENO 분석 엔진이 생성하는 분석 결과물(PDF)을 말합니다.</li>
            <li>"사전 신청"이란 베타 서비스 오픈 전 이메일을 등록하여 알림을 받는 행위를 말합니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제3조 (약관의 게시 및 변경)</h2>
          <p>
            회사는 본 약관의 내용을 서비스 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서
            약관을 변경할 수 있으며, 변경 시 시행일 7일 전부터 공지합니다. 단, 이용자에게 불리한 변경의
            경우 30일 전부터 공지합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제4조 (서비스의 내용)</h2>
          <p>회사가 제공하는 서비스의 내용은 다음과 같습니다.</p>
          <ul>
            <li>무료 분담금 시뮬레이터: 공사비 변화에 따른 분담금 변화 예측</li>
            <li>위험 등급 분류(R1~R4): 이용자의 자산 구조 기반 리스크 진단</li>
            <li>기본 리포트: 재무 현황 및 간략 리스크 요약 (유료)</li>
            <li>프리미엄 전략 리포트: 시나리오 분석, 협상 전략, 총회 발언 스크립트 포함 (유료)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>제5조 (서비스 이용)</h2>
          <p>
            이용자는 서비스를 이용할 때 실제 단지 정보에 기반한 정보를 입력해야 합니다.
            허위 정보 입력으로 발생하는 분석 결과의 오류에 대해 회사는 책임지지 않습니다.
          </p>
          <p>
            리포트는 분석 정보 제공을 목적으로 하며, 법률·세무·금융 자문을 대체하지 않습니다.
            중요한 의사결정 전 전문가 상담을 권장합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제6조 (결제 및 환불)</h2>
          <p>
            유료 리포트는 결제 완료 후 즉시 다운로드 가능합니다.
            리포트 다운로드 이전에는 전액 환불이 가능합니다.
            다운로드 완료 후에는 디지털 콘텐츠의 특성상 환불이 제한될 수 있으며,
            콘텐츠 결함이 있는 경우 고객센터를 통해 환불을 요청할 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제7조 (지식재산권)</h2>
          <p>
            서비스 및 리포트에 포함된 콘텐츠(텍스트, 분석 알고리즘, 디자인 등)의 지식재산권은
            회사에 귀속됩니다. 이용자는 리포트를 개인적 용도로만 사용할 수 있으며,
            상업적 이용·재배포·2차 저작물 제작은 금지됩니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제8조 (면책사항)</h2>
          <p>
            회사는 M-DEENO 분석 엔진의 분석 결과를 기반으로 리포트를 제공하나,
            실제 사업 결과는 시장 상황, 조합 의결, 인허가 등 다양한 외부 변수에 의해
            달라질 수 있습니다. 리포트는 참고 자료로 활용하시기 바라며,
            이에 기반한 투자·의결 결정에 대한 책임은 이용자 본인에게 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제9조 (분쟁 해결)</h2>
          <p>
            서비스 이용과 관련하여 분쟁이 발생한 경우 회사와 이용자는 성실하게 협의합니다.
            협의가 이루어지지 않을 경우 대한민국 관련 법령 및 상관례에 따릅니다.
            관할 법원은 회사 소재지를 관할하는 법원으로 합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>제10조 (문의)</h2>
          <p>
            서비스 이용약관에 관한 문의는 아래 연락처로 해주시기 바랍니다.<br />
            이메일: <a href="mailto:mdeeno.official@gmail.com">mdeeno.official@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
