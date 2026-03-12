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
              <p className={styles.heroBtnNote}>무료 · 로그인 없음 · 30초 완료</p>
            </div>

            <Link href="/reports" className={styles.secondaryBtn}>
              📄 리포트 샘플 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className={styles.socialProof}>
        <div className={styles.container}>
          <p className={styles.socialProofEyebrow}>실제 재건축 피해 사례</p>
          <div className={styles.socialProofGrid}>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>잠실 A단지</p>
              <p className={styles.spCause}>공사비 상승</p>
              <p className={styles.spAmount}>+1.2억</p>
              <p className={styles.spLabel}>추가 분담금</p>
            </div>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>압구정 B단지</p>
              <p className={styles.spCause}>사업 지연</p>
              <p className={styles.spAmount}>+8,000만</p>
              <p className={styles.spLabel}>추가 분담금</p>
            </div>
            <div className={styles.socialProofCard}>
              <p className={styles.spComplex}>목동 C단지</p>
              <p className={styles.spCause}>설계 변경</p>
              <p className={styles.spAmount}>+1.5억</p>
              <p className={styles.spLabel}>추가 분담금</p>
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
            내 분담금 분석 시작하기
          </Link>
          <p className={styles.urgencyNote}>무료 · 로그인 없음 · 30초 완료</p>
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

      <LandingLeadForm />
    </div>
  );
}
