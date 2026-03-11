'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isBetaMode } from '@/lib/feature-flags';
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

      {/* P3 — Asset Erosion Threshold */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>SECTION 02</p>
        <h4 className={styles.samplePageSectionTitle}>자산 잠식 임계점 분석</h4>
        <div className={styles.sampleThresholdBox}>
          <div className={styles.sampleThresholdNum}>+14.8%</div>
          <div className={styles.sampleThresholdDesc}>
            공사비가 이 수준을 초과하는 순간<br />
            순자산이 감소하기 시작합니다
          </div>
        </div>
        <table className={styles.sampleTable}>
          <thead>
            <tr>
              <th>공사비 변동</th>
              <th>순자산 변화</th>
              <th>자산 잠식 여부</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>+10%</td>
              <td>+240만 원</td>
              <td className={styles.tdSafe}>안전 구간</td>
            </tr>
            <tr className={styles.tableRowHighlight}>
              <td>+14.8%</td>
              <td>0원 (임계점)</td>
              <td className={styles.tdWarn}>경계 구간</td>
            </tr>
            <tr className={styles.tableRowHighlight}>
              <td>+20%</td>
              <td>-1,440만 원</td>
              <td className={styles.tdDanger}>잠식 시작</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.samplePageNote}>
          현재 조합 제시안 기준 — 임계점 초과 시 추가 대응 전략 필수
        </p>
      </div>

      {/* P4 — Assembly Questions (partial reveal) */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>SECTION 03</p>
        <h4 className={styles.samplePageSectionTitle}>총회 핵심 질문 리스트</h4>
        <ol className={styles.sampleQuestionList}>
          <li className={styles.sampleQuestionItem}>
            <span className={styles.sampleQuestionNum}>Q1</span>
            시공사가 제시한 평당 공사비 산출 근거와 원가 항목별 세부 내역서를
            총회 전 공개해 주실 수 있습니까?
          </li>
          <li className={styles.sampleQuestionItem}>
            <span className={styles.sampleQuestionNum}>Q2</span>
            공사비 상승분에 대한 일반분양가 조정 계획과, 미분양 발생 시
            조합원 분담금 추가 부담 조항이 계약서에 포함되어 있습니까?
          </li>
        </ol>
        <div className={styles.samplePartialBlurArea}>
          <div className={styles.blurContent}>
            <div className={styles.blurPlaceholder} />
            <div className={styles.blurPlaceholder} />
            <div className={styles.blurPlaceholderShort} />
          </div>
          <div className={styles.blurOverlay}>
            <p className={styles.blurOverlayText}>
              Q3–Q7은 리포트 구매 후 확인 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* P5 — Full Blur */}
      <div className={`${styles.samplePage} ${styles.samplePageBlur}`}>
        <div className={styles.blurContent}>
          <p className={styles.samplePageSectionEyebrow}>SECTION 04</p>
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

      {/* P3 — Negotiation Simulation */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>SECTION 02</p>
        <h4 className={styles.samplePageSectionTitle}>협상 절감 시뮬레이션</h4>
        <table className={styles.sampleTable}>
          <thead>
            <tr>
              <th>협상 전략</th>
              <th>절감 예상액</th>
              <th>난이도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>원가 검증 요청</td>
              <td className={styles.tdSafe}>-264만 원</td>
              <td className={styles.tdSafe}>낮음</td>
            </tr>
            <tr>
              <td>마감재 수준 협의</td>
              <td className={styles.tdWarn}>-105만 원</td>
              <td className={styles.tdWarn}>중간</td>
            </tr>
            <tr>
              <td>공기 단축 인센티브</td>
              <td className={styles.tdWarn}>-52만 원</td>
              <td className={styles.tdWarn}>중간</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 800 }}>전략 합산</td>
              <td style={{ fontWeight: 800, color: '#16a34a' }}>-421만 원</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.samplePageNote}>
          세부 협상 스크립트 및 단계별 실행 가이드는 리포트 전문에 수록
        </p>
      </div>

      {/* P4 — Speech Script (partial reveal) */}
      <div className={styles.samplePage}>
        <p className={styles.samplePageSectionEyebrow}>SECTION 03</p>
        <h4 className={styles.samplePageSectionTitle}>총회 발언 스크립트</h4>
        <div className={styles.sampleScriptBox}>
          <p className={styles.sampleScriptLabel}>발언 오프닝 — 공사비 원가 공개 요구</p>
          <p className={styles.sampleScriptText}>
            &ldquo;조합장님, 저는 금번 총회 안건에 앞서 한 가지를 공식적으로
            요청드립니다. 시공사가 제시한 평당 공사비 산출 내역서를 조합원 전원이
            확인할 수 있도록 공개해 주시기 바랍니다.&rdquo;
          </p>
        </div>
        <div className={styles.samplePartialBlurArea}>
          <div className={styles.blurContent}>
            <div className={styles.blurPlaceholder} />
            <div className={styles.blurPlaceholder} />
            <div className={styles.blurPlaceholderShort} />
          </div>
          <div className={styles.blurOverlay}>
            <p className={styles.blurOverlayText}>
              전체 스크립트(5종)는 리포트 구매 후 확인 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* P5 — Full Blur */}
      <div className={`${styles.samplePage} ${styles.samplePageBlur}`}>
        <div className={styles.blurContent}>
          <p className={styles.samplePageSectionEyebrow}>SECTION 04</p>
          <h4 className={styles.samplePageSectionTitle}>
            행동 타임라인 및 사후 대응 전략
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
          <h2 className={styles.sectionTitle}>리포트 소개</h2>
          <p className={styles.sectionSubtitle}>
            실제 생성되는 리포트를 미리 확인하고 바로 신청하세요.
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
                  <span className={styles.officialPrice}>39,000원</span>{' '}
                  29,000원{' '}
                  <span className={styles.betaTag}>
                    {isBetaMode() ? '사전 신청가' : '출시 특가'}
                  </span>
                </p>
                <p className={styles.sampleCardDesc}>
                  공사비 시나리오 분석 · 분담금 위험도 진단 · 총회 대응 질문 리스트
                </p>
                <div className={styles.sampleCardBtns}>
                  <button
                    className={styles.previewBtn}
                    onClick={() => setModalReport('basic')}
                  >
                    미리보기
                  </button>
                  <Link
                    href={isBetaMode() ? '/member' : '/member/report-basic'}
                    className={styles.applyBtn}
                  >
                    {isBetaMode() ? '무료 분석 후 신청 →' : '구매하기'}
                  </Link>
                </div>
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
                  <span className={styles.officialPrice}>149,000원</span>{' '}
                  99,000원{' '}
                  <span className={styles.betaTag}>
                    {isBetaMode() ? '사전 신청가' : '출시 특가'}
                  </span>
                </p>
                <p className={styles.sampleCardDesc}>
                  30페이지 심층 분석 · 협상 전략 · 총회 발언 스크립트 · 행동 타임라인
                </p>
                <div className={styles.sampleCardBtns}>
                  <button
                    className={styles.previewBtn}
                    onClick={() => setModalReport('premium')}
                  >
                    미리보기
                  </button>
                  <Link
                    href={isBetaMode() ? '/member' : '/member/report-premium'}
                    className={`${styles.applyBtn} ${styles.applyBtnPremium}`}
                  >
                    {isBetaMode() ? '무료 분석 후 신청 →' : '구매하기'}
                  </Link>
                </div>
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
