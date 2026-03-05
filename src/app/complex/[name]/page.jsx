import Link from 'next/link';
import styles from './page.module.css';

const SEOUL_AVG_COST = 950;

const COST_STAGES = [
  { label: '사업시행인가 전', multiplier: 1.0 },
  { label: '관리처분인가 전', multiplier: 1.12 },
  { label: '착공 후', multiplier: 1.28 },
];

const RISK_FACTORS = [
  '공사비 원가 공개 없이 총회 승인 진행되는 구조',
  '시공사의 단가 인상 요구 — 조합이 수용할 수밖에 없는 계약 구조',
  '분양가 상한제 적용 시 분양 수익 감소 → 조합원 분담금 전가',
  '사업 지연에 따른 금융 비용 누적 — 조합원 귀속',
  '정보 비대칭 — 조합원은 공사비 세부 내역 접근 불가',
];

const NEGOTIATION_ITEMS = [
  { title: '공사비 검증 전략', desc: '시공사 제출 원가 대비 실제 시공비 차이를 분석하고 협상 근거를 확보합니다.' },
  { title: '총회 대응 전략', desc: '핵심 안건별 찬반 판단 기준과 발언 전략을 시나리오로 제공합니다.' },
  { title: '분담금 감소 전략', desc: '사업 구조 분석을 통해 분담금을 최소화할 수 있는 조합원 행동 방안을 제시합니다.' },
];

export function generateMetadata({ params }) {
  const complexName = decodeURIComponent(params.name);
  return {
    title: `${complexName} 재건축 분담금 분석 | M-DEENO`,
    description: `${complexName} 재건축 사업의 분담금 위험도와 공사비 분석입니다. 내 자산 기준으로 즉시 진단하세요.`,
  };
}

export default function ComplexPage({ params }) {
  const complexName = decodeURIComponent(params.name);

  return (
    <div className={styles.wrapper}>

      {/* ── 헤더 ── */}
      <section className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO 단지 분석</p>
        <h1 className={styles.title}>{complexName} 재건축 분담금 분석</h1>
        <p className={styles.desc}>
          재건축·재개발 사업은 공사비 상승과 분양 수익 감소로 조합원 추가 분담금이
          급격히 늘어나고 있습니다. {complexName}의 사업 구조와 공사비 수준을 분석하고
          내 자산 기준 위험도를 확인하세요.
        </p>
      </section>

      {/* ── 공사비 기준 분석 ── */}
      <section className={styles.benchmarkSection}>
        <h2 className={styles.sectionTitle}>공사비 기준 분석</h2>
        <p className={styles.sectionDesc}>
          서울 평균 공사비({SEOUL_AVG_COST.toLocaleString()}만원/평)를 기준으로 사업 단계별 예상 공사비 범위를 확인하세요.
        </p>
        <div className={styles.benchmarkGrid}>
          <div className={styles.benchmarkCard}>
            <span className={styles.benchmarkLabel}>서울 평균 공사비</span>
            <span className={styles.benchmarkValue}>{SEOUL_AVG_COST.toLocaleString()}<span className={styles.benchmarkUnit}>만원/평</span></span>
            <span className={styles.benchmarkSub}>한국부동산원 기준 (2025)</span>
          </div>
          <div className={`${styles.benchmarkCard} ${styles.benchmarkHighlight}`}>
            <span className={styles.benchmarkLabel}>사업 후기 예상 공사비</span>
            <span className={`${styles.benchmarkValue} ${styles.danger}`}>
              {Math.round(SEOUL_AVG_COST * 1.28).toLocaleString()}<span className={styles.benchmarkUnit}>만원/평</span>
            </span>
            <span className={styles.benchmarkSub}>착공 후 평균 상승 반영</span>
          </div>
        </div>

        <div className={styles.stageList}>
          {COST_STAGES.map((stage) => (
            <div key={stage.label} className={styles.stageRow}>
              <span className={styles.stageLabel}>{stage.label}</span>
              <div className={styles.stageBarWrap}>
                <div
                  className={styles.stageBar}
                  style={{ width: `${(stage.multiplier / 1.28) * 100}%` }}
                />
              </div>
              <span className={styles.stageCost}>
                {Math.round(SEOUL_AVG_COST * stage.multiplier).toLocaleString()}만원/평
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 위험 요인 ── */}
      <section className={styles.riskSection}>
        <h2 className={styles.sectionTitle}>재건축 분담금 주요 위험 요인</h2>
        <ul className={styles.riskList}>
          {RISK_FACTORS.map((risk, i) => (
            <li key={i} className={styles.riskItem}>{risk}</li>
          ))}
        </ul>
      </section>

      {/* ── 전략 미리보기 ── */}
      <section className={styles.strategySection}>
        <h2 className={styles.sectionTitle}>M-DEENO 전략 리포트에서 제공하는 내용</h2>
        <div className={styles.strategyGrid}>
          {NEGOTIATION_ITEMS.map((item, i) => (
            <div key={i} className={styles.strategyCard}>
              <p className={styles.strategyTitle}>{item.title}</p>
              <p className={styles.strategyDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {complexName} 기준으로 내 분담금을 진단하세요
        </h2>
        <p className={styles.ctaDesc}>
          자산 규모와 공사비 입력만으로 위험 등급과 예상 추가 분담금을 즉시 확인할 수 있습니다.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          무료 위험도 계산하기
        </Link>
      </section>

    </div>
  );
}
