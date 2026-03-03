import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            공사비 10% 상승,
            <br />
            <span className={styles.highlight}>당신의 자산은 안전합니까?</span>
          </h1>

          <p className={styles.subtitle}>
            조합 안내 수치가 아닌,
            <strong> 내 자산 기준으로 분담금 리스크를 점검하십시오.</strong>
            <br />
            총회 대응 전략까지 자동 설계됩니다.
          </p>

          <div className={styles.btnGroup}>
            <Link href="/member" className={styles.primaryBtn}>
              📊 무료 리스크 진단 시작하기
            </Link>

            <Link href="/sample-report" className={styles.secondaryBtn}>
              📄 리포트 샘플 보기
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>단순 계산기가 아닙니다</h2>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>📉 자산 잠식 구간 예측</h3>
              <p>
                공사비 5%, 10%, 20% 상승 시 내 순자산이 언제 줄어드는지 자동
                계산
              </p>
            </div>

            <div className={styles.card}>
              <h3>📑 총회 대응 전략 자동 설계</h3>
              <p>질문 리스트, 원가 검증 요청 문구, 협상 프레임까지 구조화</p>
            </div>

            <div className={styles.card}>
              <h3>🏗 단지 전체 구조 분석</h3>
              <p>조합장/시행사용 사업성 분석 엔진 제공</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
