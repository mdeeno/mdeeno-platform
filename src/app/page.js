import Link from 'next/link';
import styles from './page.module.css';
import ReportSamplesSection from './ReportSamplesSection';

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

            <Link href="#report-samples" className={styles.secondaryBtn}>
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

      {/* ── 실제 재건축 사례 분석 ── */}
      <section className={styles.cases}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>실제 재건축 사례 분석</h2>

          <div className={styles.caseGrid}>
            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>서울 ○○아파트</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 상승</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+18%</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>조합원 평균 손실</span>
                  <span className={styles.caseStatValue}>1.2억원</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                총회 전 대응 전략 없이 원안 가결 — 조합원당 평균 1.2억 추가 분담 확정
              </p>
            </div>

            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>경기 ○○재건축</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 상승</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+23%</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>조합원 평균 손실</span>
                  <span className={styles.caseStatValue}>2.1억원</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                공사비 원가 검증 요청 없이 시공사 단가 그대로 승인 — 순자산 감소 확정
              </p>
            </div>

            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>서울 ○○주택재개발</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 상승</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+31%</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>조합원 평균 손실</span>
                  <span className={styles.caseStatValue}>3.4억원</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                협상 전략 없이 연속 총회 패배 — 분양가 조정 불가 상태에서 분담금 폭증
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReportSamplesSection />
    </div>
  );
}
