import Link from 'next/link';
import styles from './page.module.css';
import LandingLeadForm from './LandingLeadForm';
import ReportSamplesSection from './ReportSamplesSection';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            재건축 분담금,
            <br />
            <span className={styles.highlight}>실제로 얼마나 늘어날까요?</span>
          </h1>

          <p className={styles.subtitleEyebrow}>
            재건축·재개발 정비사업 조합원을 위한 분담금 리스크 분석
          </p>
          <p className={styles.subtitle}>
            M-DEENO는 조합원의 자산 기준으로<br />
            공사비 상승 시 분담금 변화를 분석합니다.
          </p>

          <div className={styles.btnGroup}>
            <div>
              <Link href="/member" className={styles.primaryBtn}>
                내 분담금 분석 시작하기
              </Link>
              <p className={styles.heroBtnNote}>로그인 없음 · 30초 완료 · 전문가 수준 분석</p>
            </div>

            <Link href="/reports" className={styles.secondaryBtn}>
              📄 리포트 샘플 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 공사비 상승 현황 ── */}
      <section className={styles.socialProof}>
        <div className={styles.container}>
          <p className={styles.socialProofEyebrow}>2026년 공사비 현황</p>
          <div className={styles.socialProofGrid}>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>서울 평균 평당 공사비</p>
              <p className={styles.spAmount}>950만원대</p>
              <p className={styles.spLabel}>2024년 843만원 대비 상승</p>
            </div>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>강남권 최고 계약 단가</p>
              <p className={styles.spAmount}>1,300만원</p>
              <p className={styles.spLabel}>신반포22차 2025년 입찰 기준</p>
            </div>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>전국 평균 공사비</p>
              <p className={styles.spAmount}>820만원대</p>
              <p className={styles.spLabel}>2024년 770만원 대비 상승 전망</p>
            </div>
          </div>
          <p className={styles.socialProofSource}>
            출처: 주거환경연구원 정비사업 공사비 실태조사(2024) + 업계 전망 기반 추정
          </p>
        </div>
      </section>

      {/* ── Urgency ── */}
      <section className={styles.urgencySection}>
        <div className={styles.container}>
          <p className={styles.urgencyText}>
            공사비가 5%만 올라가도<br />
            조합원 분담금은 크게 늘어납니다.
          </p>
          <Link href="/member" className={styles.urgencyBtn}>
            내 분담금 분석 시작하기
          </Link>
          <p className={styles.urgencyNote}>로그인 없음 · 30초 완료</p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>단순 계산기가 아닙니다</h2>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📉</div>
              <h3 className={styles.cardTitle}>내 손실이 시작되는 시점 예측</h3>
              <p>
                공사비가 몇 % 오를 때 내 순자산이 줄어들기 시작하는지
                자동으로 계산합니다
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>📑</div>
              <h3 className={styles.cardTitle}>총회 당일 쓸 수 있는 질문 제공</h3>
              <p>시공사에 요구할 질문 리스트와 발언 스크립트를 리포트에 담아드립니다</p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>🏗</div>
              <h3 className={styles.cardTitle}>공사비가 적정한지 직접 확인</h3>
              <p>조합이 제시한 공사비가 시장 기준 대비 얼마나 높은지 분석합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 시뮬레이션 예시 ── */}
      <section className={styles.cases}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>공사비 상승 시 분담금 변화 시뮬레이션</h2>
          <p className={styles.caseDisclaimer}>
            아래는 M-DEENO 분석 엔진 기반 시뮬레이션 예시이며, 실제 특정 단지의 사례가 아닙니다.
          </p>

          <div className={styles.caseGrid}>
            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>시뮬레이션 A</p>
              <p className={styles.caseCondition}>종전자산 5억 · 평당 공사비 900만원 · 34평</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 +10% 시</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+3,060만원</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>위험등급</span>
                  <span className={styles.caseStatValue}>R2 (중위험)</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                공사비 상승률이 15%를 넘으면 R3 등급으로 악화될 수 있습니다.
              </p>
            </div>

            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>시뮬레이션 B</p>
              <p className={styles.caseCondition}>종전자산 3억 · 평당 공사비 1,100만원 · 25평</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 +20% 시</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+5,500만원</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>위험등급</span>
                  <span className={styles.caseStatValue}>R3 (고위험)</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                자산 잠식률 18% — 총회 전 대응 전략 수립이 필요한 구간입니다.
              </p>
            </div>

            <div className={styles.caseCard}>
              <p className={styles.caseRegion}>시뮬레이션 C</p>
              <p className={styles.caseCondition}>종전자산 2억 · 평당 공사비 850만원 · 34평</p>
              <div className={styles.caseStats}>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>공사비 +30% 시</span>
                  <span className={`${styles.caseStatValue} ${styles.caseStatDanger}`}>+8,670만원</span>
                </div>
                <div className={styles.caseStat}>
                  <span className={styles.caseStatLabel}>위험등급</span>
                  <span className={styles.caseStatValue}>R4 (최고위험)</span>
                </div>
              </div>
              <p className={styles.caseNote}>
                자산 잠식률 43% — 즉각적인 집단 대응이 필요한 최고위험 구간입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReportSamplesSection />

      <LandingLeadForm />
    </div>
  );
}
