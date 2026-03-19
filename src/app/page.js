import Link from 'next/link';
import styles from './page.module.css';
import LandingLeadForm from './LandingLeadForm';
import ReportSamplesSection from './ReportSamplesSection';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* ── 히어로 ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            재건축 분담금,
            <br />
            <span className={styles.highlight}>실제로 얼마나 늘어날까요?</span>
          </h1>

          <p className={styles.subtitle}>
            공사비 10% 오르면 내 분담금은?<br />
            30초면 확인합니다.
          </p>

          <div className={styles.btnGroup}>
            <Link href="/member" className={styles.primaryBtn}>
              내 분담금 무료 분석하기
            </Link>
            <p className={styles.heroBtnNote}>무료 · 회원가입 불필요 · 30초 완료</p>
          </div>
        </div>
      </section>

      {/* ── 이런 분께 필요합니다 ── */}
      <section className={styles.audience}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>이런 분께 필요합니다</h2>
          <div className={styles.audienceGrid}>
            <div className={styles.audienceCard}>
              <div className={styles.audienceIcon}>🗳</div>
              <h3 className={styles.audienceCardTitle}>총회를 앞두고 계신 조합원</h3>
              <p className={styles.audienceCardDesc}>
                시공사가 제시한 공사비가 적정한지, 총회에서 어떤 질문을 해야 하는지 알려드립니다.
              </p>
            </div>
            <div className={styles.audienceCard}>
              <div className={styles.audienceIcon}>💰</div>
              <h3 className={styles.audienceCardTitle}>분담금 통보를 받으셨나요?</h3>
              <p className={styles.audienceCardDesc}>
                추가 분담금이 정말 이 금액이 맞는지, 공사비가 더 오르면 얼마나 늘어나는지 확인하세요.
              </p>
            </div>
            <div className={styles.audienceCard}>
              <div className={styles.audienceIcon}>📈</div>
              <h3 className={styles.audienceCardTitle}>공사비 인상이 걱정되시나요?</h3>
              <p className={styles.audienceCardDesc}>
                공사비가 몇 % 오르면 내 자산이 위험해지는지, 그 임계점을 정확히 계산해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 분석하면 이런 걸 알 수 있습니다 ── */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>분석하면 이런 걸 알 수 있습니다</h2>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📉</div>
              <h3 className={styles.cardTitle}>공사비 몇 % 오르면 위험한지</h3>
              <p>
                내 자산이 잠식되기 시작하는 임계점을
                자동으로 계산합니다
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>💵</div>
              <h3 className={styles.cardTitle}>추가 분담금이 실제 얼마인지</h3>
              <p>공사비 상승률별 시나리오를 비교하고, 월 상환 기준으로 환산해 드립니다</p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>🎤</div>
              <h3 className={styles.cardTitle}>총회에서 어떤 질문을 해야 하는지</h3>
              <p>귀하의 위험 등급에 맞춘 질문 5가지와 발언 스크립트를 제공합니다</p>
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

      {/* ── Urgency ── */}
      <section className={styles.urgencySection}>
        <div className={styles.container}>
          <p className={styles.urgencyText}>
            공사비가 5%만 올라가도<br />
            조합원 분담금은 크게 늘어납니다.
          </p>
          <Link href="/member" className={styles.urgencyBtn}>
            내 분담금 무료 분석하기
          </Link>
          <p className={styles.urgencyNote}>회원가입 불필요 · 30초 완료</p>
        </div>
      </section>

      <ReportSamplesSection />

      <LandingLeadForm />
    </div>
  );
}
