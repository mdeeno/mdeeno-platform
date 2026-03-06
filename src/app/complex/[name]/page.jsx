import Link from 'next/link';
import styles from './page.module.css';

const SEOUL_AVG_COST = 950;

const STAGE_RISKS = [
  { value: 'planning',     label: '기본계획 수립',  risk: 'R1', desc: '사업 초기 — 분담금 변동폭 가장 큰 구간' },
  { value: 'approval',     label: '사업시행인가',   risk: 'R2', desc: '공사비 미확정 — 인상 리스크 본격화' },
  { value: 'management',   label: '관리처분인가',   risk: 'R3', desc: '분담금 확정 시점 — 협상 마지막 기회' },
  { value: 'construction', label: '착공 / 공사 중', risk: 'R4', desc: '착공 후 추가 공사비 전가 위험 최고조' },
];

const RISK_COLOR = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };
const RISK_BG    = { R1: '#f0fdf4', R2: '#fffbeb', R3: '#fff1f2', R4: '#fef2f2' };
const RISK_BORDER = { R1: '#bbf7d0', R2: '#fde68a', R3: '#fecaca', R4: '#fecaca' };

function seedCost(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return 870 + (h % 10) * 35; // 870 ~ 1,185 만원/평
}

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
  const complexCost = seedCost(complexName);
  const rangeMin = (complexCost * 0.085).toFixed(1);
  const rangeMax = (complexCost * 0.175).toFixed(1);
  const costRatio = Math.round(((complexCost - SEOUL_AVG_COST) / SEOUL_AVG_COST) * 100);

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

      {/* ── 1. 공사비 분석 ── */}
      <section className={styles.dataSection}>
        <h2 className={styles.sectionTitle}>공사비 분석</h2>
        <p className={styles.sectionDesc}>서울 평균 공사비 대비 {complexName}의 예상 공사비 수준입니다.</p>

        <div className={styles.costCards}>
          <div className={styles.costCard}>
            <span className={styles.costCardEyebrow}>서울 평균 공사비</span>
            <span className={styles.costCardValue}>{SEOUL_AVG_COST.toLocaleString()}</span>
            <span className={styles.costCardUnit}>만원/평</span>
            <span className={styles.costCardSub}>한국부동산원 기준 (2025)</span>
          </div>
          <div className={`${styles.costCard} ${complexCost > SEOUL_AVG_COST ? styles.costCardDanger : styles.costCardSafe}`}>
            <span className={styles.costCardEyebrow}>해당 단지 예상 공사비</span>
            <span className={`${styles.costCardValue} ${complexCost > SEOUL_AVG_COST ? styles.danger : ''}`}>
              {complexCost.toLocaleString()}
            </span>
            <span className={styles.costCardUnit}>만원/평</span>
            <span className={styles.costCardSub}>
              {costRatio > 0 ? `서울 평균 +${costRatio}%` : costRatio < 0 ? `서울 평균 ${costRatio}%` : '서울 평균과 동일'}
            </span>
          </div>
        </div>

        <div className={styles.costCompare}>
          <div className={styles.costRow}>
            <span className={styles.costRowLabel}>서울 평균</span>
            <div className={styles.costBarWrap}>
              <div
                className={styles.costBar}
                style={{ width: `${Math.round((SEOUL_AVG_COST / Math.max(complexCost, SEOUL_AVG_COST)) * 88)}%` }}
              />
            </div>
            <span className={styles.costRowVal}>{SEOUL_AVG_COST.toLocaleString()}만원</span>
          </div>
          <div className={styles.costRow}>
            <span className={styles.costRowLabel}>해당 단지</span>
            <div className={styles.costBarWrap}>
              <div
                className={`${styles.costBar} ${styles.costBarHighlight}`}
                style={{ width: `${Math.round((complexCost / Math.max(complexCost, SEOUL_AVG_COST)) * 88)}%` }}
              />
            </div>
            <span className={`${styles.costRowVal} ${complexCost > SEOUL_AVG_COST ? styles.danger : ''}`}>
              {complexCost.toLocaleString()}만원
            </span>
          </div>
          <p className={styles.costNote}>
            {costRatio > 0
              ? `서울 평균보다 ${costRatio}% 높음 — 분담금 증가 위험 존재`
              : costRatio < 0
              ? `서울 평균보다 ${Math.abs(costRatio)}% 낮음 — 상대적 안정 구간`
              : '서울 평균과 동일한 수준'}
          </p>
        </div>
      </section>

      {/* ── 2. 예상 분담금 범위 ── */}
      <section className={styles.dataSection}>
        <h2 className={styles.sectionTitle}>예상 추가 분담금 범위</h2>
        <p className={styles.sectionDesc}>공사비 및 자산 구조 기준 시뮬레이션 범위입니다.</p>
        <div className={styles.rangeBox}>
          <div className={styles.rangeBig}>
            <div className={styles.rangeBigItem}>
              <span className={styles.rangeBigLabel}>최소 예상</span>
              <span className={styles.rangeBigVal}>{rangeMin}억</span>
            </div>
            <span className={styles.rangeTilde}>~</span>
            <div className={styles.rangeBigItem}>
              <span className={styles.rangeBigLabel}>최대 예상</span>
              <span className={`${styles.rangeBigVal} ${styles.danger}`}>{rangeMax}억</span>
            </div>
          </div>
          <div className={styles.rangeTrackWrap}>
            <div className={styles.rangeTrackFill} />
          </div>
          <p className={styles.rangeNote}>
            * 평균 자산가 3억 기준 시뮬레이션 — 실제 값은 자산 규모·비례율에 따라 달라집니다.
          </p>
        </div>
      </section>

      {/* ── 3. 사업 단계 위험도 ── */}
      <section className={styles.dataSection}>
        <h2 className={styles.sectionTitle}>사업 단계별 위험도</h2>
        <p className={styles.sectionDesc}>단계가 진행될수록 분담금 협상 여지가 줄어듭니다.</p>
        <div className={styles.stageRiskGrid}>
          {STAGE_RISKS.map((s) => (
            <div
              key={s.value}
              className={styles.stageRiskCard}
              style={{ background: RISK_BG[s.risk], borderColor: RISK_BORDER[s.risk] }}
            >
              <span className={styles.stageRiskBadge} style={{ color: RISK_COLOR[s.risk] }}>
                {s.risk}
              </span>
              <span className={styles.stageRiskName}>{s.label}</span>
              <span className={styles.stageRiskDesc}>{s.desc}</span>
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

      {/* ── 조합원 참여 현황 ── */}
      <section className={styles.participationSection}>
        <div className={styles.participationHeader}>
          <p className={styles.participationEyebrow}>실시간 베타 참여 현황</p>
          <h2 className={styles.participationTitle}>{complexName} 조합원 참여</h2>
        </div>
        <div className={styles.participationStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>34</span>
            <span className={styles.statUnit}>명</span>
            <span className={styles.statLabel}>현재 참여 조합원</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={styles.statValue}>1.2</span>
            <span className={styles.statUnit}>억</span>
            <span className={styles.statLabel}>평균 예상 분담금</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.statRisk}`}>R3</span>
            <span className={styles.statLabel}>평균 위험 등급</span>
          </div>
        </div>
        <p className={styles.participationNote}>
          * 베타 기간 수집 데이터 기준 — 참여자 증가 중
        </p>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {complexName} 기준으로 내 분담금을 진단하세요
        </h2>
        <p className={styles.ctaDesc}>
          자산 규모와 공사비 입력만으로 위험 등급과 예상 추가 분담금을 즉시 확인할 수 있습니다.
        </p>
        <Link
          href={`/member?complex_name=${encodeURIComponent(complexName)}`}
          className={styles.ctaBtn}
        >
          우리 단지 기준으로 분담금 계산하기
        </Link>
      </section>

    </div>
  );
}
