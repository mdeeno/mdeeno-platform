import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

// ── 지역별 데이터 ───────────────────────────────────────────────────────────
const REGION_DATA = {
  seoul: {
    name: '서울시',
    fullName: '서울시 재건축 분담금 리스크 분석',
    description:
      '서울시 재건축 사업은 최근 공사비 급등으로 조합원 분담금이 크게 증가하고 있습니다. 특히 한강변 및 강남권 단지를 중심으로 평당 공사비가 서울 평균을 크게 상회하는 사례가 늘고 있습니다.',
    avgCost: 950,
    costTrend: '+18%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '1.4억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R3',
    riskLabel: '고위험',
    riskColor: '#e63946',
    risks: [
      '공사비 원가 검증 없이 총회 강행 사례 다수',
      '시공사 단가 인상 요구에 조합이 수용하는 구조',
      '분양가 상한제로 분양 수익 축소 → 분담금 전가',
      '사업 지연에 따른 금융 비용 조합원 부담 증가',
    ],
    trend: [
      { year: '2022', cost: 780 },
      { year: '2023', cost: 850 },
      { year: '2024', cost: 920 },
      { year: '2025', cost: 950 },
    ],
    metaTitle: '서울 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '서울시 재건축 공사비 상승 현황과 조합원 분담금 위험도를 분석합니다. 내 자산 기준으로 즉시 진단하세요.',
  },
  gangnam: {
    name: '강남구',
    fullName: '강남구 재건축 분담금 리스크 분석',
    description:
      '강남구는 전국 재건축 사업 중 평당 공사비가 가장 높은 지역입니다. 고급 마감재 적용과 시공사 협상력 약화로 조합원 분담금 부담이 급격히 증가하고 있으며, 순자산 감소 사례가 속출하고 있습니다.',
    avgCost: 1180,
    costTrend: '+22%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '2.8억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R4',
    riskLabel: '최고위험',
    riskColor: '#b91c1c',
    risks: [
      '서울 평균 대비 24% 높은 평당 공사비 수준',
      '재건축 초과이익환수제 부담 조합원 귀속',
      '고급화 시공 요구로 공사비 협상 여지 축소',
      '총회 과반 확보 어려운 구조 — 조합 집행부 주도 결의',
    ],
    trend: [
      { year: '2022', cost: 960 },
      { year: '2023', cost: 1020 },
      { year: '2024', cost: 1120 },
      { year: '2025', cost: 1180 },
    ],
    metaTitle: '강남구 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '강남구 재건축 공사비 상승 현황과 조합원 분담금 위험도를 분석합니다. 내 자산 기준으로 즉시 진단하세요.',
  },
  mokdong: {
    name: '목동',
    fullName: '목동 재건축 분담금 리스크 분석',
    description:
      '목동 아파트 단지는 대규모 재건축이 본격화되면서 공사비 협상이 핵심 쟁점으로 부상했습니다. 대단지 특성상 총회 동원이 어렵고, 조합원들의 정보 비대칭이 심각한 수준입니다.',
    avgCost: 980,
    costTrend: '+15%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '1.8억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R3',
    riskLabel: '고위험',
    riskColor: '#e63946',
    risks: [
      '대단지 특성 — 총회 정족수 충족 어려워 집행부 주도',
      '공사비 원가 공개 요구 시 조합 측 정보 제공 거부 사례',
      '목동 6·7·12단지 선행 사업 대비 후속 단지 공사비 급등',
      '안전진단 재실시 지연으로 사업 장기화 → 금융 비용 증가',
    ],
    trend: [
      { year: '2022', cost: 820 },
      { year: '2023', cost: 870 },
      { year: '2024', cost: 940 },
      { year: '2025', cost: 980 },
    ],
    metaTitle: '목동 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '목동 재건축 공사비 상승 현황과 조합원 분담금 위험도를 분석합니다. 내 자산 기준으로 즉시 진단하세요.',
  },

  'apgujeong-construction-cost': {
    name: '압구정',
    fullName: '압구정 재건축 공사비 분석',
    description:
      '압구정 현대·한양·미성 단지는 서울에서 평당 공사비가 가장 높은 재건축 사업장입니다. 고급 마감 요구와 한강변 시공 조건으로 공사비가 서울 평균의 1.3배를 상회하며, 조합원 추가 분담금 부담이 급격히 증가하고 있습니다.',
    avgCost: 1250,
    costTrend: '+26%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '3.2억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R4',
    riskLabel: '최고위험',
    riskColor: '#b91c1c',
    risks: [
      '평당 공사비 1,250만원 — 서울 평균(950만원) 대비 31% 초과',
      '한강변 초고층 설계 변경으로 공사비 추가 인상 예고',
      '재건축 초과이익환수제 부담 — 조합원당 수억원 추가 납부',
      '일반분양가 규제로 분양 수익 제한 → 전액 조합원 전가 구조',
    ],
    trend: [
      { year: '2022', cost: 990 },
      { year: '2023', cost: 1070 },
      { year: '2024', cost: 1180 },
      { year: '2025', cost: 1250 },
    ],
    metaTitle: '압구정 재건축 공사비 분석 — 조합원 분담금 위험도 | M-DEENO',
    metaDesc: '압구정 재건축 공사비 상승 현황과 조합원 분담금 위험도를 분석합니다. 평당 1,250만원 수준의 공사비가 내 자산에 미치는 영향을 즉시 계산하세요.',
  },

  'mokdong-contribution': {
    name: '목동',
    fullName: '목동 재건축 조합원 분담금 분석',
    description:
      '목동 재건축 조합원 분담금은 사업 단계 진입 시 급격히 증가하는 구조입니다. 단지별 비례율 차이와 공사비 인상 전가 구조를 이해하지 못하면 수억원의 예상치 못한 분담금이 발생할 수 있습니다.',
    avgCost: 990,
    costTrend: '+16%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '1.9억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R3',
    riskLabel: '고위험',
    riskColor: '#e63946',
    risks: [
      '비례율 하락 시 종전자산 평가액 감소 → 분담금 자동 증가',
      '공사비 인상분의 90% 이상이 분담금 형태로 조합원에 전가',
      '목동 단지별 사업 속도 차이 — 후순위 단지일수록 공사비 불리',
      '1인당 대지 지분 소규모 — 분양 수익 배분 한계로 분담금 상쇄 불가',
    ],
    trend: [
      { year: '2022', cost: 830 },
      { year: '2023', cost: 880 },
      { year: '2024', cost: 950 },
      { year: '2025', cost: 990 },
    ],
    metaTitle: '목동 재건축 분담금 계산 — 조합원 추가 부담 분석 | M-DEENO',
    metaDesc: '목동 재건축 조합원 분담금 구조와 공사비 인상 리스크를 분석합니다. 내 자산 기준 추가 분담금을 즉시 계산하세요.',
  },

  'yeouido-reconstruction': {
    name: '여의도',
    fullName: '여의도 재건축 분담금 리스크 분석',
    description:
      '여의도 아파트 단지는 한강변 초고층 재건축으로 주목받고 있습니다. 그러나 높은 공사비와 재건축 초과이익환수제 부담이 맞물려 조합원 분담금 리스크가 서울 최상위 수준입니다.',
    avgCost: 1100,
    costTrend: '+20%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '2.5억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R4',
    riskLabel: '최고위험',
    riskColor: '#b91c1c',
    risks: [
      '초고층 설계 채택 — 일반 재건축 대비 공사비 30~40% 추가 발생',
      '재건축 초과이익환수제 대상 — 조합원당 수억원 추가 납부 가능',
      '분양가 규제와 고급화 공사비의 역방향 압박',
      '한강변 공법 제약으로 공사비 절감 협상 여지 극히 제한적',
    ],
    trend: [
      { year: '2022', cost: 900 },
      { year: '2023', cost: 970 },
      { year: '2024', cost: 1050 },
      { year: '2025', cost: 1100 },
    ],
    metaTitle: '여의도 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '여의도 재건축 공사비 상승과 초과이익환수제 부담이 조합원 분담금에 미치는 영향을 분석합니다.',
  },

  'mapo-reconstruction': {
    name: '마포구',
    fullName: '마포구 재건축 분담금 리스크 분석',
    description:
      '마포구 재건축은 상대적으로 낮은 공사비로 중위험 구간에 해당하지만, 최근 2년간 공사비 상승 속도가 빠르게 오르고 있습니다. 사업 초기 단지일수록 향후 공사비 인상 리스크가 높습니다.',
    avgCost: 890,
    costTrend: '+14%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '1.1억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R2',
    riskLabel: '중위험',
    riskColor: '#d97706',
    risks: [
      '2023년 이후 공사비 상승 속도 가파름 — 서울 평균 수렴 중',
      '사업 초기 단지 비율 높음 — 착공 전 공사비 재협상 가능성',
      '분양 시장 위축 시 일반분양 수익 감소 → 분담금 전가',
      '조합 설립 단계 단지는 5~7년 후 최종 분담금 확정 — 불확실성 상존',
    ],
    trend: [
      { year: '2022', cost: 760 },
      { year: '2023', cost: 810 },
      { year: '2024', cost: 860 },
      { year: '2025', cost: 890 },
    ],
    metaTitle: '마포구 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '마포구 재건축 공사비 상승 현황과 조합원 분담금 위험도를 분석합니다. 내 자산 기준으로 즉시 진단하세요.',
  },

  'nowon-reconstruction': {
    name: '노원구',
    fullName: '노원구 재건축 분담금 리스크 분석',
    description:
      '노원구는 서울에서 재건축 사업장이 집중된 지역 중 하나입니다. 상계·중계 단지를 중심으로 재건축이 진행 중이며, 낮은 대지 가치 대비 공사비 비율이 높아 분담금 부담이 예상보다 클 수 있습니다.',
    avgCost: 860,
    costTrend: '+13%',
    costTrendDesc: '2023년 대비 평당 공사비 상승률',
    avgLoss: '0.9억원',
    avgLossDesc: '조합원 1인당 평균 추가 분담금',
    riskLevel: 'R2',
    riskLabel: '중위험',
    riskColor: '#d97706',
    risks: [
      '낮은 대지 공시지가 대비 공사비 비율 — 비례율 하락 구조',
      '일반분양 수요 불확실 — 분양 미달 시 분담금 전액 조합원 부담',
      '저층 소형 평형 중심 — 재건축 후 대형 평형 전환 비용 추가 발생',
      '인근 시세 낮아 일반분양가 상한이 낮음 → 수익 보전 한계',
    ],
    trend: [
      { year: '2022', cost: 730 },
      { year: '2023', cost: 780 },
      { year: '2024', cost: 830 },
      { year: '2025', cost: 860 },
    ],
    metaTitle: '노원구 재건축 분담금 리스크 분석 | M-DEENO',
    metaDesc: '노원구 재건축 공사비 상승과 분담금 위험도를 분석합니다. 상계·중계 재건축 조합원이라면 즉시 진단하세요.',
  },
};

export function generateStaticParams() {
  return Object.keys(REGION_DATA).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const region = REGION_DATA[params.slug];
  if (!region) return {};
  return {
    title: region.metaTitle,
    description: region.metaDesc,
  };
}

export default function AnalysisPage({ params }) {
  const region = REGION_DATA[params.slug];
  if (!region) notFound();

  const maxCost = Math.max(...region.trend.map((t) => t.cost));

  return (
    <div className={styles.wrapper}>

      {/* ── 헤더 ── */}
      <section className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO 지역 분석</p>
        <h1 className={styles.title}>{region.fullName}</h1>
        <p className={styles.desc}>{region.description}</p>
      </section>

      {/* ── 핵심 지표 ── */}
      <section className={styles.metricsSection}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>공사비 상승률</span>
          <span className={`${styles.metricValue} ${styles.danger}`}>{region.costTrend}</span>
          <span className={styles.metricSub}>{region.costTrendDesc}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>현재 평균 공사비</span>
          <span className={styles.metricValue}>{region.avgCost.toLocaleString()}만원<span className={styles.metricUnit}>/평</span></span>
          <span className={styles.metricSub}>서울 평균 950만원 대비</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>조합원 평균 손실</span>
          <span className={`${styles.metricValue} ${styles.danger}`}>{region.avgLoss}</span>
          <span className={styles.metricSub}>{region.avgLossDesc}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>종합 위험 등급</span>
          <span className={styles.metricValue} style={{ color: region.riskColor }}>
            {region.riskLevel}
          </span>
          <span className={styles.metricSub}>{region.riskLabel}</span>
        </div>
      </section>

      {/* ── 공사비 추이 ── */}
      <section className={styles.trendSection}>
        <h2 className={styles.sectionTitle}>공사비 상승 추이 (만원/평)</h2>
        <div className={styles.trendChart}>
          {region.trend.map((row) => (
            <div key={row.year} className={styles.trendBar}>
              <div
                className={styles.trendBarFill}
                style={{ height: `${(row.cost / maxCost) * 100}%` }}
              />
              <span className={styles.trendBarValue}>{row.cost.toLocaleString()}</span>
              <span className={styles.trendBarYear}>{row.year}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 위험 요인 ── */}
      <section className={styles.riskSection}>
        <h2 className={styles.sectionTitle}>주요 위험 요인</h2>
        <ul className={styles.riskList}>
          {region.risks.map((risk, i) => (
            <li key={i} className={styles.riskItem}>{risk}</li>
          ))}
        </ul>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          내 자산은 얼마나 위험합니까?
        </h2>
        <p className={styles.ctaDesc}>
          {region.name} 공사비 기준으로 내 분담금 리스크를 즉시 진단하세요.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          무료 분담금 계산하기
        </Link>
      </section>

    </div>
  );
}
