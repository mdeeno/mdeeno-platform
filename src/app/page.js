import Link from 'next/link';
import styles from './page.module.css';
import LandingLeadForm from './LandingLeadForm';
import ReportSamplesSection from './ReportSamplesSection';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* ── 히어로 ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              이거 모르고 총회 들어가면
              <br />
              <span className={styles.highlight}>수억 손해봅니다</span>
            </h1>

            <p className={styles.subtitle}>
              공사비 <span className={styles.subtitleAccent}>10%</span> 오르면
              분담금 최대 <span className={styles.subtitleAccent}>8,000만원</span> 증가합니다.
              <br />
              지금 내 위험도를 확인하세요.
            </p>

            <div className={styles.btnGroup}>
              <Link href="/member" className={styles.primaryBtn}>
                내 분담금 위험도 확인하기
              </Link>
              <p className={styles.heroBtnNote}>무료 · 회원가입 불필요 · 30초 완료</p>
            </div>

            <p className={styles.heroChildNote}>
              부모님 댁 재건축, 자녀분이 대신 확인해 보세요
            </p>

            <Link href="/sample-report" className={styles.heroSubLink}>
              리포트 샘플 보기 →
            </Link>
          </div>

          {/* 히어로 우측 — 결과 미리보기 목업 (티저) */}
          <Link href="/member" className={styles.heroMockup}>
            <div className={styles.mockupCard}>
              <p className={styles.mockupEyebrow}>M-DEENO 분석 결과 예시</p>
              <div className={styles.mockupGrade}>
                <span className={styles.mockupGradeBadge}>R3</span>
                <span className={styles.mockupGradeLabel}>고위험</span>
              </div>
              <div className={styles.mockupStats}>
                <div className={styles.mockupStat}>
                  <span className={styles.mockupStatLabel}>추가 분담금 증가</span>
                  <span className={styles.mockupStatValue}>+8,050만원</span>
                </div>
                <div className={styles.mockupStat}>
                  <span className={styles.mockupStatLabel}>내 자산 손실 비율</span>
                  <span className={styles.mockupStatValue}>24.0%</span>
                </div>
              </div>
              <p className={styles.mockupNote}>공사비 10% 상승 시나리오 기준</p>
              <div className={styles.mockupOverlay}>
                <span className={styles.mockupOverlayBtn}>내 결과 확인하기 →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 피해 사례 ── */}
      <section className={styles.socialProof}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>최근 재건축 추가 분담금 변동 사례</h2>
          <div className={styles.socialProofGrid}>
            <div className={styles.socialProofCard}>
              <div>
                <p className={styles.spComplex}>서울 A단지</p>
                <p className={styles.spCause}>공사비 인상안 원안 가결</p>
                <p className={styles.spResult}>조합원당 1.2억 추가 확정</p>
              </div>
              <div>
                <span className={styles.spAmount}>1.2억</span>
                <span className={styles.spLabel}>추가 분담금</span>
              </div>
            </div>
            <div className={styles.socialProofCard}>
              <div>
                <p className={styles.spComplex}>경기 B단지</p>
                <p className={styles.spCause}>설계 변경 + 자재비 상승</p>
                <p className={styles.spResult}>당초 대비 1.5배 추가 분담금 증가</p>
              </div>
              <div>
                <span className={styles.spAmount}>+50%</span>
                <span className={styles.spLabel}>추가 분담금 증가율</span>
              </div>
            </div>
            <div className={styles.socialProofCard}>
              <div>
                <p className={styles.spComplex}>서울 C단지</p>
                <p className={styles.spCause}>공기 지연 + 금융비 상승</p>
                <p className={styles.spResult}>입주 전 추가 2,800만원 통보</p>
              </div>
              <div>
                <span className={styles.spAmount}>2,800만</span>
                <span className={styles.spLabel}>추가 통보액</span>
              </div>
            </div>
          </div>
          <p className={styles.socialProofSource}>
            (사)주거환경연구원 정비사업 공사비 실태조사(2024, 65개 구역 실측) 기반 시뮬레이션 예시
          </p>
          <div className={styles.sectionCta}>
            <Link href="/member" className={styles.sectionCtaBtn}>
              내 단지는 어떤 상황인지 확인하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 단순 계산기가 아닙니다 ── */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>전문가처럼 분석해 줍니다</h2>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📉</div>
              <h3 className={styles.cardTitle}>손실 시작 시점 계산</h3>
              <p>
                공사비가 몇 % 오르면 내 돈이 줄어드는지, 그 한계선을 찾아줍니다
              </p>
              <p className={styles.cardExample}>
                예: 공사비가 +10.9% 오르면 고위험 단계 진입
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>🎤</div>
              <h3 className={styles.cardTitle}>총회 질문·발언 대본 제공</h3>
              <p>내 위험 등급에 맞춰 총회에서 바로 읽을 수 있는 질문과 발언 대본을 드립니다</p>
              <p className={styles.cardExample}>
                예: 시공사에 원가 분리 소명을 요구하는 질문 5개
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper}>💵</div>
              <h3 className={styles.cardTitle}>공사비 비교 분석</h3>
              <p>다른 단지와 공사비를 비교하고, 매달 얼마씩 부담하는지 계산합니다</p>
              <p className={styles.cardExample}>
                예: 인근 단지 대비 평당 40만원 높은 것으로 분석
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 결과 기대감 ── */}
      <section className={styles.resultPreview}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>분석하면 이런 결과를 알 수 있습니다</h2>
          <div className={styles.resultPreviewGrid}>
            <div className={`${styles.resultPreviewCard} ${styles.resultR4}`}>
              <span className={styles.resultBadge}>R4 최고위험</span>
              <p className={styles.resultDesc}>
                공사비 10% 상승 시 분담금 +8,670만원, 자산 손실 구간 진입
              </p>
            </div>
            <div className={`${styles.resultPreviewCard} ${styles.resultR3}`}>
              <span className={styles.resultBadge}>R3 고위험</span>
              <p className={styles.resultDesc}>
                추가 분담금 +5,500만원, 총회 대응 필요
              </p>
            </div>
            <div className={`${styles.resultPreviewCard} ${styles.resultR2}`}>
              <span className={styles.resultBadge}>R2 중위험</span>
              <p className={styles.resultDesc}>
                상황에 따라 손실 가능, 모니터링 권장
              </p>
            </div>
            <div className={`${styles.resultPreviewCard} ${styles.resultR1}`}>
              <span className={styles.resultBadge}>R1 관리가능</span>
              <p className={styles.resultDesc}>
                현재 안정, 정기 모니터링 권장
              </p>
            </div>
          </div>
          <div className={styles.sectionCta}>
            <Link href="/member" className={styles.sectionCtaBtn}>
              내 위험 등급 확인하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 시뮬레이션 예시 ── */}
      <section className={styles.cases}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>공사비 상승 시 추가 분담금 변화 시뮬레이션</h2>
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
              <span className={styles.caseBadge}>M-DEENO 분석: R2</span>
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
              <span className={styles.caseBadge}>M-DEENO 분석: R3</span>
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
              <span className={styles.caseBadge}>M-DEENO 분석: R4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgency ── */}
      <section className={styles.urgencySection}>
        <div className={styles.container}>
          <div className={styles.urgencyStats}>
            <div className={styles.urgencyStat}>
              <span className={styles.urgencyStatNum}>2,424</span>
              <span className={styles.urgencyStatLabel}>전국 정비사업 구역 수</span>
            </div>
            <div className={styles.urgencyStat}>
              <span className={styles.urgencyStatNum}>수억 원</span>
              <span className={styles.urgencyStatLabel}>평균 분담금 규모</span>
            </div>
          </div>
          <p className={styles.urgencyText}>
            공사비는 계속 오르고 있습니다.<br />
            이미 분담금이 확정된 단지도 많습니다.<br />
            총회 이후에는 늦습니다.
          </p>
          <Link href="/member" className={styles.urgencyBtn}>
            내 분담금 위험도 확인하기
          </Link>
          <p className={styles.urgencyNote}>무료 · 회원가입 불필요 · 30초 완료</p>
        </div>
      </section>

      <ReportSamplesSection />

      {/* ── 리포트 비교표 ── */}
      <section className={styles.compareSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>베이직 vs 프리미엄 비교</h2>
          <div className={styles.compareTableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>포함 항목</th>
                  <th>베이직</th>
                  <th className={styles.comparePremiumHead}>프리미엄</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>시나리오 분석 (0%/5%/10%/20%)</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
                <tr>
                  <td>자산 잠식 시점 경고</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
                <tr>
                  <td>총회 핵심 질문 5가지 (인쇄 가능)</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
                <tr>
                  <td>협상 절감 시뮬레이션</td>
                  <td className={styles.compareMiss}>&#10007;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
                <tr>
                  <td>총회 발언 스크립트 5종 (마이크 앞에서 바로 읽기 가능)</td>
                  <td className={styles.compareMiss}>&#10007;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
                <tr>
                  <td>30일 행동 타임라인 + 체크리스트</td>
                  <td className={styles.compareMiss}>&#10007;</td>
                  <td className={styles.compareCheck}>&#10003;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.sectionCta}>
            <Link href="/member" className={styles.sectionCtaBtn}>
              내 분담금 위험도 확인하기 →
            </Link>
          </div>
        </div>
      </section>

      <LandingLeadForm />

      {/* ── Sticky Bottom CTA (모바일) ── */}
      <div className={styles.stickyBottomCTA}>
        <Link href="/member" className={styles.stickyBottomBtn}>
          내 분담금 위험도 확인하기
        </Link>
      </div>
    </div>
  );
}
