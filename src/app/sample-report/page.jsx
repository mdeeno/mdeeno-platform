import styles from './page.module.css';

export default function SampleReport() {
  return (
    <div className={styles.container}>
      <div className={styles.a4Paper}>
        <div className={styles.watermark}>M-DEENO DATA LAB</div>

        {/* 헤더 */}
        <div className={styles.header}>
          <div>
            <div className={styles.docType}>[총회 제출용 대외비]</div>
            <h1 className={styles.title}>
              공사비 민감도 분석 및<br />
              분담금 변동 리포트
            </h1>
          </div>
          <div className={styles.metaInfo}>
            <strong>분석 대상:</strong> OOO 아파트 (34평형)
            <br />
            <strong>발행 기관:</strong> M-DEENO Prop-Logic™
            <br />
            <strong>발행 일자:</strong> 2026. 00. 00.
          </div>
        </div>

        {/* 섹션 1: 종합 진단 */}
        <h2 className={styles.sectionTitle}>📊 1. 종합 리스크 진단 요약</h2>
        <div className={styles.summaryBox}>
          <div className={styles.scoreWrap}>
            <span className={styles.scoreLabel}>
              현재 시공사 요구 기준 사업 안정성 (R-Score)
            </span>
            <span className={styles.scoreValue}>
              91.2점{' '}
              <span style={{ fontSize: '1rem', color: '#e21d48' }}>
                (주의 구간)
              </span>
            </span>
          </div>
          <div className={styles.impactText}>
            🚨 현재 조합이 안내한 &apos;평당 900만 원&apos; 공사비 수용 시, 최초
            사업계획 대비 <br />
            <span style={{ color: '#e21d48' }}>
              {' '}
              조합원 1인당 평균 7,480만 원의 추가 분담금
            </span>
            이 발생할 것으로 강하게 추정됩니다.
          </div>
        </div>

        {/* 섹션 2: 시나리오 표 */}
        <h2 className={styles.sectionTitle}>
          📈 2. 공사비 시나리오별 분담금 추정 표
        </h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>시나리오 구분</th>
              <th>평당 공사비</th>
              <th>예상 비례율</th>
              <th>내 지분 가치</th>
              <th>예상 추가 분담금</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>최초 사업계획안</td>
              <td>750만 원</td>
              <td>105.5%</td>
              <td>8.9억 원</td>
              <td style={{ color: '#16a34a', fontWeight: '700' }}>
                0원 (환급 대상)
              </td>
            </tr>
            <tr className={styles.dangerRow}>
              <td>현재 시공사 요구안</td>
              <td>900만 원</td>
              <td>91.2%</td>
              <td>7.7억 원</td>
              <td style={{ color: '#e21d48' }}>+ 7,480만 원</td>
            </tr>
            <tr>
              <td>최악 가정 (물가상승 10%)</td>
              <td>990만 원</td>
              <td>82.5%</td>
              <td>7.0억 원</td>
              <td style={{ color: '#e21d48' }}>+ 1억 4,800만 원</td>
            </tr>
          </tbody>
        </table>

        {/* 섹션 3: 전문가 소견 */}
        <h2 className={styles.sectionTitle}>
          💡 3. M-DEENO 분석 의견 및 대응 전략
        </h2>
        <div className={styles.expertComment}>
          시공사가 요구한 평당 900만 원은 최근 6개월 내 강남/서초권 유사 사업장
          평균 계약단가(860만 원) 대비 <strong>약 4.6% 초과된 수치</strong>
          입니다. <br />
          <br />
          본 리포트의 수치를 근거로, 다가오는 임시총회에서 조합 측에 다음 두
          가지를 공식 안건으로 요구할 것을 강력히 권장합니다.
          <br />
          <br />
          <strong>
            ① 마감재 수준 하향 없는 공사비 원가 검증 내역서 투명 공개
          </strong>
          <br />
          <strong>
            ② 일반분양가 상승 및 미분양 리스크를 동시 반영한 2차 시뮬레이션 실시
          </strong>
        </div>
        <br />

        {/* 푸터 */}
        <div className={styles.footer}>
          <span>
            * 본 리포트는 입력된 추정치 기반의 시뮬레이션 결과로, 법적 분쟁의
            직접적 증거로 사용될 수 없습니다.
          </span>
          <span style={{ fontWeight: '700', color: '#334155' }}>
            M-DEENO Prop-Logic™
          </span>
        </div>
      </div>
    </div>
  );
}
