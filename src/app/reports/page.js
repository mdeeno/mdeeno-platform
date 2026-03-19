import ReportSamplesSection from '@/app/ReportSamplesSection';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: '리포트 소개 | M-DEENO',
  description:
    '재건축 분담금 리스크 분석 리포트의 구성과 샘플을 확인하세요. 기본 리포트부터 프리미엄 전략 리포트까지.',
};

export default function ReportsPage() {
  return (
    <div className={styles.wrapper}>
      {/* ── 섹션 1: 헤더 ── */}
      <div className={styles.heroBar}>
        <p className={styles.eyebrow}>M-DEENO</p>
        <h1 className={styles.title}>리포트 소개</h1>
        <p className={styles.desc}>
          내 분담금이 얼마나 위험한지 수치로 확인하고<br />
          총회 당일 쓸 수 있는 대응 전략까지 담았습니다.
        </p>
        <p className={styles.heroSub}>
          리포트를 왜 받아야 하나요? 공사비 상승 시 추가 분담금은 수천만원에서 억 단위까지 늘어날 수 있지만,
          대부분의 조합원은 이를 총회 당일에야 알게 됩니다. M-DEENO 리포트는 총회 전에 준비할 수 있는 유일한 도구입니다.
        </p>
      </div>

      {/* ── 섹션 2: 리포트 샘플 미리보기 ── */}
      <ReportSamplesSection />

      {/* ── 섹션 3: 비교표 ── */}
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
                  <td>총회 발언 스크립트 5종</td>
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
        </div>
      </section>

      {/* ── 섹션 4: 이런 분께 추천합니다 ── */}
      <section className={styles.recommendSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>이런 분께 추천합니다</h2>
          <div className={styles.recommendGrid}>
            <div className={styles.recommendCard}>
              <p className={styles.recommendLabel}>베이직 리포트</p>
              <ul className={styles.recommendList}>
                <li>현재 상황이 궁금한 분</li>
                <li>분담금 규모를 처음 파악하는 분</li>
                <li>총회 전 기본 데이터를 확인하고 싶은 분</li>
              </ul>
              <p className={styles.recommendPrice}>29,000원 (사전 신청가)</p>
            </div>
            <div className={`${styles.recommendCard} ${styles.recommendCardPremium}`}>
              <p className={styles.recommendBadge}>추천</p>
              <p className={styles.recommendLabel}>프리미엄 전략 리포트</p>
              <ul className={styles.recommendList}>
                <li>총회를 앞두고 전략이 필요한 분</li>
                <li>공사비 인상안에 반대하려는 분</li>
                <li>협상 근거와 발언 대본이 필요한 분</li>
                <li>시공사 대응 체크리스트가 필요한 분</li>
              </ul>
              <p className={styles.recommendPrice}>99,000원 (사전 신청가)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 섹션 5: CTA ── */}
      <section className={styles.bottomCta}>
        <div className={styles.container}>
          <p className={styles.bottomCtaText}>
            리포트를 받으려면 먼저 무료 분석이 필요합니다.
          </p>
          <Link href="/member" className={styles.ctaBtn}>
            무료 분석부터 시작하기 →
          </Link>
          <p className={styles.bottomCtaNote}>무료 · 회원가입 불필요 · 30초 완료</p>
        </div>
      </section>
    </div>
  );
}
