'use client';

import { useState } from 'react';
import styles from './page.module.css';

// ─────────────────────────────────────────────
//  Sample page content — Basic Report
// ─────────────────────────────────────────────
function BasicSamplePages() {
  return (
    <>
      {/* P1 — Cover */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageEyebrow}>M-DEENO Prop-Logic™</p>
        <h3 className={styles.samplePageTitle}>
          재건축 분담금<br />위험도 분석 리포트
        </h3>
        <div className={styles.samplePageMeta}>
          <span>분석 단지: OO아파트</span>
          <span>종전자산: 5.0억 원</span>
          <span>발행일: 2026.03.05</span>
        </div>
        <span className={`${styles.sampleRiskBadge} ${styles.badgeR2}`}>
          R2 — 중위험
        </span>
      </div>

      {/* P2 — Scenario Table */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>SECTION 01</p>
        <h4 className={styles.samplePageSectionTitle}>시나리오별 분담금 분석</h4>
        <table className={styles.sampleTable}>
          <thead>
            <tr>
              <th>시나리오</th>
              <th>공사비 변동</th>
              <th>예상 분담금</th>
              <th>위험도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>현재 기준</td>
              <td>0%</td>
              <td>1.20억 원</td>
              <td className={styles.tdSafe}>안정</td>
            </tr>
            <tr>
              <td>+10% 시나리오</td>
              <td>+10%</td>
              <td>1.32억 원</td>
              <td className={styles.tdWarn}>중위험</td>
            </tr>
            <tr className={styles.tableRowHighlight}>
              <td>+20% 시나리오</td>
              <td>+20%</td>
              <td>1.44억 원</td>
              <td className={styles.tdDanger}>고위험</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.samplePageNote}>
          공사비 20% 상승 시 자산 잠식률 28.8% — 협상 대응 필요
        </p>
      </div>

      {/* P3 — Blurred */}
      <div className={`${styles.samplePage} ${styles.samplePageBlur}`}>
        <div className={styles.blurContent}>
          <p className={styles.samplePageSectionEyebrow}>SECTION 02</p>
          <h4 className={styles.samplePageSectionTitle}>
            손실 체감 분석 및 총회 대응 전략
          </h4>
          <div className={styles.blurPlaceholder} />
          <div className={styles.blurPlaceholder} />
          <div className={styles.blurPlaceholderShort} />
        </div>
        <div className={styles.blurOverlay}>
          <p className={styles.blurOverlayText}>
            전체 리포트는 구매 후 확인 가능합니다.
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  Sample page content — Premium Report
// ─────────────────────────────────────────────
function PremiumSamplePages() {
  return (
    <>
      {/* P1 — Cover (dark) */}
      <div className={`${styles.samplePage} ${styles.samplePageDark}`}>
        <div className={styles.samplePageAccentBar} />
        <p className={styles.samplePageLogoLight}>M — DEENO · Prop-Logic™</p>
        <p className={styles.samplePageEyebrowLight}>조합원 전략 리포트</p>
        <h3 className={styles.samplePageTitleLight}>
          재건축 공사비 리스크<br />총회 대응 전략 패키지
        </h3>
        <div className={styles.samplePageMetaLight}>
          <span>분석 단지: OO아파트</span>
          <span>수신인: 홍길동 조합원</span>
          <span>발행일: 2026.03.05</span>
        </div>
        <span className={`${styles.sampleRiskBadge} ${styles.badgeR3}`}>
          R3 — 고위험
        </span>
      </div>

      {/* P2 — Executive Summary */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>EXECUTIVE SUMMARY</p>
        <h4 className={styles.samplePageSectionTitle}>핵심 위험 지표</h4>
        <div className={styles.sampleShockNumber}>+1,200만원</div>
        <p className={styles.sampleShockLabel}>
          공사비 10% 상승 시 추가 예상 손실
        </p>
        <div className={styles.sampleMetricRow}>
          <div className={styles.sampleMetric}>
            <span className={styles.sampleMetricLabel}>자산 잠식률</span>
            <span className={`${styles.sampleMetricValue} ${styles.valueDanger}`}>
              24.0%
            </span>
          </div>
          <div className={styles.sampleMetric}>
            <span className={styles.sampleMetricLabel}>위험 등급</span>
            <span className={`${styles.sampleMetricValue} ${styles.valueWarn}`}>
              R3
            </span>
          </div>
          <div className={styles.sampleMetric}>
            <span className={styles.sampleMetricLabel}>협상 절감 가능</span>
            <span className={`${styles.sampleMetricValue} ${styles.valueSafe}`}>
              ~264만원
            </span>
          </div>
        </div>
      </div>

      {/* P3+ — Blurred */}
      <div className={`${styles.samplePage} ${styles.samplePageBlur}`}>
        <div className={styles.blurContent}>
          <p className={styles.samplePageSectionEyebrow}>SECTION 03</p>
          <h4 className={styles.samplePageSectionTitle}>
            협상 전략 및 총회 발언 스크립트
          </h4>
          <div className={styles.blurPlaceholder} />
          <div className={styles.blurPlaceholder} />
          <div className={styles.blurPlaceholderShort} />
        </div>
        <div className={styles.blurOverlay}>
          <p className={styles.blurOverlayText}>
            전체 전략 리포트는 구매 후 확인 가능합니다.
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  Main exported component
// ─────────────────────────────────────────────
export default function ReportSamplesSection() {
  const [modalReport, setModalReport] = useState(null);

  return (
    <>
      <section id="report-samples" className={styles.reportSamples}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>리포트 샘플</h2>
          <p className={styles.sectionSubtitle}>
            실제 생성되는 리포트의 구성을 미리 확인하세요.
          </p>

          <div className={styles.sampleGrid}>
            {/* ── Basic ── */}
            <div className={styles.sampleCard}>
              <div className={styles.sampleCoverThumb}>
                <p className={styles.sampleCoverEyebrow}>M-DEENO</p>
                <p className={styles.sampleCoverTitle}>기본 리포트</p>
                <p className={styles.sampleCoverSub}>분담금 위험도 분석</p>
                <span className={`${styles.sampleRiskBadge} ${styles.badgeR2}`}>R2</span>
              </div>
              <div className={styles.sampleCardBody}>
                <p className={styles.sampleCardLabel}>기본 리포트</p>
                <p className={styles.sampleCardPrice}>
                  29,000원{' '}
                  <span className={styles.betaTag}>(베타 무료)</span>
                </p>
                <p className={styles.sampleCardDesc}>
                  공사비 시나리오 분석 · 분담금 위험도 진단 · 총회 대응 질문 리스트
                </p>
                <button
                  className={styles.previewBtn}
                  onClick={() => setModalReport('basic')}
                >
                  미리보기
                </button>
              </div>
            </div>

            {/* ── Premium ── */}
            <div className={`${styles.sampleCard} ${styles.sampleCardFeatured}`}>
              <div className={`${styles.sampleCoverThumb} ${styles.sampleCoverThumbDark}`}>
                <p className={styles.sampleCoverEyebrowDark}>M-DEENO</p>
                <p className={styles.sampleCoverTitleDark}>프리미엄 전략 리포트</p>
                <p className={styles.sampleCoverSubDark}>총회 대응 전략 패키지</p>
                <span className={`${styles.sampleRiskBadge} ${styles.badgeR3}`}>R3</span>
              </div>
              <div className={styles.sampleCardBody}>
                <p className={styles.sampleCardLabel}>프리미엄 전략 리포트</p>
                <p className={styles.sampleCardPrice}>
                  99,000원{' '}
                  <span className={styles.betaTag}>(베타 무료)</span>
                </p>
                <p className={styles.sampleCardDesc}>
                  30페이지 심층 분석 · 협상 전략 · 총회 발언 스크립트 · 행동 타임라인
                </p>
                <button
                  className={`${styles.previewBtn} ${styles.previewBtnRed}`}
                  onClick={() => setModalReport('premium')}
                >
                  미리보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preview Modal ── */}
      {modalReport && (
        <div
          className={styles.sampleModalBackdrop}
          onClick={() => setModalReport(null)}
        >
          <div
            className={styles.sampleModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sampleModalHeader}>
              <p className={styles.sampleModalTitle}>
                {modalReport === 'basic'
                  ? '기본 리포트'
                  : '프리미엄 전략 리포트'}{' '}
                미리보기
              </p>
              <button
                className={styles.sampleModalClose}
                onClick={() => setModalReport(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.sampleModalBody}>
              {modalReport === 'basic'
                ? <BasicSamplePages />
                : <PremiumSamplePages />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
