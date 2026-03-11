'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { downloadPdf } from '@/lib/download-pdf';
import { isBetaMode } from '@/lib/feature-flags';
import styles from './page.module.css';

const STAGE_OPTIONS = [
  { value: 'planning',     label: '기본계획 수립 단계 (사업 초기)' },
  { value: 'approval',     label: '사업시행인가 단계 (공사 계획 승인)' },
  { value: 'management',   label: '관리처분인가 단계 (이주·철거 전후)' },
  { value: 'construction', label: '착공 / 공사 진행 단계' },
];

const INITIAL_FORM = {
  expected_extra:     '',
  asset_value:        '',
  cost_increase_rate: '10',
  project_stage:      'approval',
  member_name:        '',
  complex_name:       '',
  location:           '',
  construction_cost:  '900',
};

function formatAmount(eokValue) {
  if (eokValue == null) return '—';
  const manwon = Math.round(eokValue * 10000);
  if (manwon >= 10000) return `${eokValue.toFixed(1)}억 원`;
  return `${manwon.toLocaleString()}만 원`;
}

const RISK_LABELS = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };

export default function ShockCalculatorPage() {
  const router = useRouter();
  const [form, setForm]           = useState(INITIAL_FORM);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone]     = useState(false);
  const [pdfError, setPdfError]   = useState(null);
  const [reportId, setReportId]   = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail]                   = useState('');
  const [emailError, setEmailError]         = useState('');
  const [betaDone, setBetaDone]             = useState(false);
  const [betaLoading, setBetaLoading]       = useState(false);
  const [isModalPrivacyAgreed, setIsModalPrivacyAgreed] = useState(false);
  const [pendingNav, setPendingNav]         = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cn = params.get('complex_name');
    if (cn) setForm((prev) => ({ ...prev, complex_name: cn }));
  }, []);

  // Navigate after email collected (betaDone becomes true)
  useEffect(() => {
    if (betaDone && pendingNav) {
      router.push(pendingNav);
      setPendingNav(null);
    }
  }, [betaDone, pendingNav, router]);

  // Gate report navigation behind email collection
  function handleReportNav(href) {
    if (betaDone || pdfDone) {
      router.push(href);
    } else {
      setPendingNav(href);
      setEmailModalOpen(true);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  const isValid =
    form.expected_extra     !== '' && Number(form.expected_extra)     > 0 &&
    form.asset_value        !== '' && Number(form.asset_value)        > 0 &&
    form.cost_increase_rate !== '' && Number(form.cost_increase_rate) >= 0 &&
    form.member_name.trim()   !== '' &&
    form.complex_name.trim()  !== '' &&
    form.location.trim()      !== '' &&
    form.construction_cost  !== '' && Number(form.construction_cost)  > 0;

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

      // Save context for /member/report-basic (no re-entry needed there)
      try {
        localStorage.setItem('basicReportContext', JSON.stringify({
          assetValue:    form.asset_value,
          expectedExtra: form.expected_extra,
          riskGrade:     data.risk_level,
        }));
      } catch {}

      setTimeout(() => {
        document.getElementById('shock-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // 충격 수치 확인 후 이메일 수집 — 결과를 충분히 확인한 뒤 모달 노출
      setTimeout(() => {
        if (!betaDone && !pdfDone) setEmailModalOpen(true);
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadReport(emailAddress) {
    setPdfError(null);
    setPdfDone(false);
    setPdfLoading(true);

    try {
      const id = await downloadPdf(
        '/api/member-premium-report',
        {
          asset_value:    Number(form.asset_value),
          expected_extra: Number(form.expected_extra),
          member_name:    form.member_name.trim(),
          complex_name:   form.complex_name.trim(),
          location:       form.location.trim() || '해당 지역',
          cost:           Number(form.construction_cost) || 900,
          email:          emailAddress,
        },
        'M-DEENO_프리미엄전략리포트.pdf',
      );
      if (id) setReportId(id);
      setPdfDone(true);
    } catch (err) {
      setPdfError(err.message ?? 'PDF 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleBetaSubmit(emailAddress) {
    setBetaLoading(true);
    try {
      const res = await fetch('/api/member-beta-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:          emailAddress,
          asset_value:    Number(form.asset_value)    || null,
          expected_extra: Number(form.expected_extra) || null,
          risk_grade:     result?.risk_level          || null,
        }),
      });
      if (!res.ok) throw new Error('신청에 실패했습니다.');
      setBetaDone(true);
    } catch (err) {
      setPdfError(err.message ?? '신청에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBetaLoading(false);
    }
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!isModalPrivacyAgreed) {
      setEmailError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    setEmailModalOpen(false);
    // pendingNav: navigate after beta submit via useEffect
    if (isBetaMode()) {
      handleBetaSubmit(email.trim());
    } else {
      handleDownloadReport(email.trim());
      if (pendingNav) {
        router.push(pendingNav);
        setPendingNav(null);
      }
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
          내 자산 위험도를 즉시 분석합니다.
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
              <p className={styles.fieldHint}>내 아파트의 감정평가 금액</p>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="asset_value"
                  name="asset_value"
                  type="number"
                  value={form.asset_value}
                  onChange={handleChange}
                  placeholder="금액을 입력해주세요"
                  min="0.1"
                  step="0.1"
                  required
                />
                <span className={styles.unit}>억원</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="expected_extra">
                예상 추가 분담금 <span className={styles.req}>*</span>
              </label>
              <p className={styles.fieldHint}>조합이 통보한 입주 시 추가 납부 예정 금액</p>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="expected_extra"
                  name="expected_extra"
                  type="number"
                  value={form.expected_extra}
                  onChange={handleChange}
                  placeholder="금액을 입력해주세요"
                  min="0.1"
                  step="0.1"
                  required
                />
                <span className={styles.unit}>억원</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cost_increase_rate">
                예상 공사비 상승률 <span className={styles.req}>*</span>
              </label>
              <p className={styles.fieldHint}>시공사 요청 또는 예상되는 공사비 인상률 (모르면 10% 기본값 사용)</p>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="cost_increase_rate"
                  name="cost_increase_rate"
                  type="number"
                  value={form.cost_increase_rate}
                  onChange={handleChange}
                  placeholder="10을 입력해주세요"
                  min="0"
                  max="100"
                  step="1"
                  required
                />
                <span className={styles.unit}>%</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="project_stage">
                현재 사업 단계 <span className={styles.req}>*</span>
              </label>
              <p className={styles.fieldHint}>단계가 뒤로 갈수록 공사비 확정 시점에 가까워집니다</p>
              <select
                className={styles.input}
                id="project_stage"
                name="project_stage"
                value={form.project_stage}
                onChange={handleChange}
                required
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Personalization Fields ── */}
        <div className={styles.formCard}>
          <p className={styles.formSectionLabel}>리포트 개인화</p>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="member_name">
                조합원 이름 <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                id="member_name"
                name="member_name"
                type="text"
                value={form.member_name}
                onChange={handleChange}
                placeholder="이름을 입력해주세요"
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="complex_name">
                아파트 단지명 <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                id="complex_name"
                name="complex_name"
                type="text"
                value={form.complex_name}
                onChange={handleChange}
                placeholder="단지명을 입력해주세요"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="location">
                사업장 지역 <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="00시 00구를 입력해주세요"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="construction_cost">
                평당 공사비 <span className={styles.req}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  id="construction_cost"
                  name="construction_cost"
                  type="number"
                  value={form.construction_cost}
                  onChange={handleChange}
                  placeholder="공사비를 입력해주세요"
                  min="1"
                  step="10"
                  required
                />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <p className={styles.privacyNote}>
          🔒 입력하신 자산 정보는 암호화되어 안전하게 처리됩니다.
        </p>

        <button className={styles.submitBtn} type="submit" disabled={loading || !isValid}>
          {loading ? (
            <span className={styles.loadingInner}>
              <span className={styles.spinner} />
              분석 중...
            </span>
          ) : (
            '내 분담금 분석 시작하기'
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

          <p className={styles.urgencyNote}>
            공사비가 5%만 올라가도 분담금은 크게 변합니다.
          </p>

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
            <p className={styles.savingsDisclaimer}>
              * 공사비 10% 상승 가정, 협상·총회 전략 실행 시 시뮬레이션 결과입니다.
            </p>
          </div>

          {/* 3. Strategy Simulation Preview */}
          {(() => {
            const negotiation = result.expected_contribution - result.comparison_contribution;
            const assembly    = Math.round(negotiation * 0.4 * 100) / 100;
            const appraisal   = Math.round(negotiation * 0.2 * 100) / 100;
            const strategies  = [
              {
                title:  '협상 전략',
                desc:   '공사비 원가 검증 및 시공사 협상 실행',
                saving: negotiation,
              },
              {
                title:  '총회 대응 전략',
                desc:   '총회 발언·집단 대응으로 인상안 저지',
                saving: assembly,
              },
              {
                title:  '감정평가 대응',
                desc:   '종전자산 재평가 요구로 분담금 구조 개선',
                saving: appraisal,
              },
            ];
            return (
              <div className={styles.simSection}>
                <p className={styles.simLabel}>전략별 예상 절감 효과</p>
                <p className={styles.simNote}>
                  M-DEENO 전략 엔진이 귀하의 위험 등급({result.risk_level})을 기반으로 시뮬레이션한 결과입니다.
                </p>
                <div className={styles.simGrid}>
                  {strategies.map((s) => (
                    <div key={s.title} className={styles.simCard}>
                      <p className={styles.simCardTitle}>{s.title}</p>
                      <p className={styles.simCardDesc}>{s.desc}</p>
                      <p className={styles.simCardSaving}>
                        -{formatAmount(s.saving)}
                        <span className={styles.simCardSavingNote}> 절감 가능</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 4. Risk-based Tier Recommendation */}
          <div className={
            ['R1', 'R2'].includes(result.risk_level)
              ? styles.tierRecommendBasic
              : styles.tierRecommendPremium
          }>
            <p className={styles.tierRecommendTitle}>
              {['R1', 'R2'].includes(result.risk_level)
                ? `위험 등급 ${result.risk_level} — 기본 리포트로 충분히 대응 가능합니다`
                : `위험 등급 ${result.risk_level} — 프리미엄 전략 리포트가 필요합니다`}
            </p>
            <p className={styles.tierRecommendDesc}>
              {['R1', 'R2'].includes(result.risk_level)
                ? '자산 구조 검증과 총회 질문 5개를 담은 기본 리포트로 핵심 리스크를 확인하세요.'
                : '협상 전략·총회 발언 스크립트·행동 타임라인이 포함된 프리미엄 리포트로 총회에서 이기세요.'}
            </p>
          </div>

          {/* 5. Strategy Blur + CTA */}
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
              <p className={styles.premiumHeadline}>
                총회에서 이길 전략까지<br />제공합니다
              </p>
              <ul className={styles.upsellList}>
                <li className={styles.upsellItem}>협상 질문 리스트</li>
                <li className={styles.upsellItem}>총회 발언 스크립트</li>
                <li className={styles.upsellItem}>시공사 대응 전략</li>
              </ul>
              {!isBetaMode() && (
                <p className={styles.ctaPrice}>
                  <span className={styles.ctaPriceBeta}>베타 99,000원 · 정가 149,000원</span>
                </p>
              )}

              {pdfError && (
                <p className={styles.ctaError}>{pdfError}</p>
              )}

              {isBetaMode() ? (
                <>
                  <button
                    className={styles.ctaBtn}
                    onClick={() => !betaDone && setEmailModalOpen(true)}
                    disabled={betaLoading || betaDone}
                  >
                    {betaLoading ? (
                      <span className={styles.ctaBtnInner}>
                        <span className={styles.ctaSpinner} />
                        신청 처리 중...
                      </span>
                    ) : betaDone ? (
                      '베타 신청 완료 ✓'
                    ) : (
                      '사전 신청하기 →'
                    )}
                  </button>
                  <p className={styles.ctaNote}>
                    {betaDone
                      ? '신청해 주셔서 감사합니다. 리포트 준비 완료 시 이메일로 안내드립니다.'
                      : '6월 정식 출시 시 이메일로 우선 안내드립니다'}
                  </p>
                </>
              ) : (
                <>
                  <button
                    className={styles.ctaBtn}
                    onClick={() => setEmailModalOpen(true)}
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
                </>
              )}

              {pdfDone && reportId && (
                <div className={styles.shareUrlBox}>
                  <p className={styles.shareUrlLabel}>리포트 공유 링크</p>
                  <div className={styles.shareUrlRow}>
                    <span className={styles.shareUrlText}>
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/report/${reportId}`
                        : `/report/${reportId}`}
                    </span>
                    <button
                      className={styles.shareUrlCopyBtn}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/report/${reportId}`);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2500);
                      }}
                    >
                      {shareCopied ? '복사됨 ✓' : '복사'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Secondary Report CTA — 등급에 따라 역방향 추천 */}
          {(() => {
            const reportParams = `?asset=${encodeURIComponent(form.asset_value)}&extra=${encodeURIComponent(form.expected_extra)}&grade=${encodeURIComponent(result.risk_level)}`;
            const isLowRisk = ['R1', 'R2'].includes(result.risk_level);
            const href = isLowRisk
              ? `/member/report-premium${reportParams}`
              : `/member/report-basic${reportParams}`;
            return (
              <div className={styles.basicReportCta}>
                <p className={styles.basicReportCtaLabel}>
                  {isLowRisk ? '더 심층적인 전략이 필요하다면?' : '우선 기본 구조만 확인하고 싶다면?'}
                </p>
                <button
                  className={styles.basicReportCtaBtn}
                  onClick={() => handleReportNav(href)}
                >
                  {isLowRisk ? '프리미엄 전략 리포트 보기 →' : '기본 리포트 보기 →'}
                </button>
              </div>
            );
          })()}

        </div>
      )}

      <p className={styles.disclaimer}>
        * 본 분석 결과는 입력값 기반 시뮬레이션으로, 법적 증거로 사용될 수 없습니다.
      </p>

      {/* ── Email Gate Modal ── */}
      {emailModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setEmailModalOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.modalTitle}>
              {isBetaMode() ? '사전 신청 — 이메일 등록' : '리포트를 받을 이메일'}
            </p>
            <p className={styles.modalDesc}>
              {isBetaMode()
                ? '이메일을 등록하시면 6월 정식 출시 시 결제 링크와 함께 우선 안내드립니다.'
                : '이메일을 등록하면 리포트가 즉시 생성됩니다.'}
            </p>

            <ul className={styles.modalBenefits}>
              {isBetaMode() ? (
                <>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>6월 출시 시 <strong>결제 링크 우선 발송</strong></span>
                  </li>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>사전 신청자 한정 <strong>출시 특가 적용</strong></span>
                  </li>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>공사비 상승 시 <strong>업데이트 알림</strong> 수신</span>
                  </li>
                </>
              ) : (
                <>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>PDF 즉시 생성 · <strong>30초 이내 다운로드</strong></span>
                  </li>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>공사비 상승 시 <strong>리포트 업데이트 알림</strong> 수신</span>
                  </li>
                  <li className={styles.modalBenefit}>
                    <span className={styles.modalBenefitIcon}>✓</span>
                    <span>총회 일정 변경 등 <strong>핵심 정보 자동 알림</strong></span>
                  </li>
                </>
              )}
            </ul>

            <form onSubmit={handleModalSubmit} noValidate>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="modal_email">
                  이메일 주소
                </label>
                <input
                  className={styles.modalInput}
                  id="modal_email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <label className={styles.modalPrivacyRow}>
                <input
                  type="checkbox"
                  checked={isModalPrivacyAgreed}
                  onChange={(e) => { setIsModalPrivacyAgreed(e.target.checked); setEmailError(''); }}
                />
                <span className={styles.modalPrivacyText}>
                  개인정보 수집·이용에 동의합니다 (이메일, 자산 정보 — 리포트 발송 목적)
                </span>
              </label>

              {emailError && (
                <p className={styles.modalError}>{emailError}</p>
              )}

              <button className={styles.modalSubmitBtn} type="submit">
                {isBetaMode() ? '베타 신청하기' : '리포트 생성하기'}
              </button>
              <button
                className={styles.modalCancelBtn}
                type="button"
                onClick={() => setEmailModalOpen(false)}
              >
                취소
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
