'use client';

import { useState } from 'react';
import { downloadPdf } from '@/lib/download-pdf';
import styles from './page.module.css';

const STAGE_OPTIONS = [
  { value: 'planning',     label: '기본계획 수립 단계' },
  { value: 'approval',     label: '사업시행인가 단계' },
  { value: 'management',   label: '관리처분인가 단계' },
  { value: 'construction', label: '착공 / 공사 진행 단계' },
];

const INITIAL_FORM = {
  expected_extra:     '',
  asset_value:        '',
  cost_increase_rate: '10',
  project_stage:      'approval',
};

function formatAmount(eokValue) {
  if (eokValue == null) return '—';
  const manwon = Math.round(eokValue * 10000);
  if (manwon >= 10000) return `${eokValue.toFixed(1)}억 원`;
  return `${manwon.toLocaleString()}만 원`;
}

const RISK_LABELS = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };

export default function ShockCalculatorPage() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone]     = useState(false);
  const [pdfError, setPdfError]   = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  const isValid =
    form.expected_extra !== '' && Number(form.expected_extra) > 0 &&
    form.asset_value    !== '' && Number(form.asset_value)    > 0 &&
    form.cost_increase_rate !== '' && Number(form.cost_increase_rate) >= 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/shock-calc', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_extra:     Number(form.expected_extra),
          asset_value:        Number(form.asset_value),
          cost_increase_rate: Number(form.cost_increase_rate),
          project_stage:      form.project_stage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '분석에 실패했습니다.');

      setResult(data);
      setTimeout(() => {
        document.getElementById('shock-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadReport() {
    setPdfError(null);
    setPdfDone(false);
    setPdfLoading(true);

    try {
      await downloadPdf(
        '/api/member-premium-report',
        {
          asset_value:    Number(form.asset_value),
          expected_extra: Number(form.expected_extra),
          cost:           900,
        },
        'M-DEENO_프리미엄전략리포트.pdf',
      );
      setPdfDone(true);
    } catch (err) {
      setPdfError(err.message ?? 'PDF 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO Prop-Logic™</p>
        <h1 className={styles.title}>
          내 자산이 얼마나<br />위험한지 지금 확인하세요
        </h1>
        <p className={styles.subtitle}>
          추가 분담금 규모와 사업 단계를 입력하면<br />
          M-DEENO가 귀하의 자산 위험도를 즉시 분석합니다.
        </p>
      </div>

      {/* ── Input Form ── */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formCard}>
          <p className={styles.formSectionLabel}>자산 정보 입력</p>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="asset_value">
                종전자산 평가액 <span className={styles.req}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="asset_value"
                  name="asset_value"
                  type="number"
                  value={form.asset_value}
                  onChange={handleChange}
                  placeholder="5"
                  min="0.1"
                  step="0.1"
                />
                <span className={styles.unit}>억원</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="expected_extra">
                예상 추가 분담금 <span className={styles.req}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="expected_extra"
                  name="expected_extra"
                  type="number"
                  value={form.expected_extra}
                  onChange={handleChange}
                  placeholder="1.2"
                  min="0.1"
                  step="0.1"
                />
                <span className={styles.unit}>억원</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cost_increase_rate">
                예상 공사비 상승률
              </label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="cost_increase_rate"
                  name="cost_increase_rate"
                  type="number"
                  value={form.cost_increase_rate}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className={styles.unit}>%</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="project_stage">
                현재 사업 단계
              </label>
              <select
                className={styles.input}
                id="project_stage"
                name="project_stage"
                value={form.project_stage}
                onChange={handleChange}
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <button className={styles.submitBtn} type="submit" disabled={loading || !isValid}>
          {loading ? (
            <span className={styles.loadingInner}>
              <span className={styles.spinner} />
              분석 중...
            </span>
          ) : (
            '내 자산 위험도 즉시 분석하기'
          )}
        </button>
      </form>

      {/* ── Shock Result ── */}
      {result && (
        <div id="shock-result" className={styles.resultSection}>

          {/* 1. Shock */}
          <div className={styles.riskBadgeRow}>
            <span className={`${styles.riskBadge} ${styles[`riskBadge${result.risk_level}`]}`}>
              {result.risk_level}
            </span>
            <span className={styles.riskBadgeLabel}>
              {RISK_LABELS[result.risk_level]} — 위험 등급
            </span>
          </div>

          <div className={styles.shockBox}>
            <p className={styles.shockLead}>현재 구조라면</p>
            <p className={styles.shockAmount}>{formatAmount(result.expected_contribution)}</p>
            <p className={styles.shockSub}>의 추가 분담금이 발생할 가능성이 매우 높습니다.</p>
            <p className={styles.shockMessage}>{result.shock_message}</p>
          </div>

          {/* 2. Comparison */}
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <p className={styles.comparisonLabel}>현재 구조</p>
              <p className={styles.comparisonValueRed}>{formatAmount(result.expected_contribution)}</p>
              <p className={styles.comparisonNote}>아무 행동도 하지 않을 경우</p>
            </div>
            <div className={styles.comparisonDivider}>VS</div>
            <div className={styles.comparisonCard}>
              <p className={styles.comparisonLabel}>전략 적용</p>
              <p className={styles.comparisonValueBlue}>{formatAmount(result.comparison_contribution)}</p>
              <p className={styles.comparisonNote}>협상 전략 실행 후</p>
            </div>
          </div>

          <div className={styles.savingsHighlight}>
            <p className={styles.savingsLabel}>예상 절감액</p>
            <p className={styles.savingsAmount}>
              {formatAmount(result.expected_contribution - result.comparison_contribution)}
            </p>
            <p className={styles.savingsNote}>전략 리포트 적용 시 최대 절감 가능 금액</p>
          </div>

          {/* 3 + 4. Strategy Preview + CTA */}
          <div className={styles.strategyWrap}>
            <div className={styles.strategyBlur} aria-hidden="true">
              <p className={styles.strategyBlurTitle}>M-DEENO 맞춤 전략 분석</p>
              <ul className={styles.strategyList}>
                <li className={styles.strategyItem}>공사비 협상 전략</li>
                <li className={styles.strategyItem}>총회 발언 스크립트</li>
                <li className={styles.strategyItem}>사업 구조 분석</li>
                <li className={styles.strategyItem}>협상 포인트</li>
                <li className={styles.strategyItem}>총회 대응 전략</li>
              </ul>
            </div>
            <div className={styles.strategyOverlay}>
              <p className={styles.ctaTitle}>
                총회 전 내 자산을 지키는<br />
                30페이지 전략 리포트 보기
              </p>
              <p className={styles.ctaPrice}>
                <span className={styles.ctaPriceBeta}>베타가 99,000원</span>
              </p>

              {pdfError && (
                <p className={styles.ctaError}>{pdfError}</p>
              )}

              <button
                className={styles.ctaBtn}
                onClick={handleDownloadReport}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <span className={styles.ctaBtnInner}>
                    <span className={styles.ctaSpinner} />
                    조합원님의 전략 리포트를 생성 중입니다...
                  </span>
                ) : pdfDone ? (
                  'PDF 다운로드 완료'
                ) : (
                  '전략 리포트 지금 받기 →'
                )}
              </button>

              <p className={styles.ctaNote}>
                {pdfDone
                  ? '다운로드 폴더를 확인해 주세요.'
                  : 'PDF 즉시 다운로드 · 생성까지 약 30초'}
              </p>
            </div>
          </div>

        </div>
      )}

      <p className={styles.disclaimer}>
        * 본 분석 결과는 입력값 기반 시뮬레이션으로, 법적 증거로 사용될 수 없습니다.
      </p>
    </div>
  );
}
