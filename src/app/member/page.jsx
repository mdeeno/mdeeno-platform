'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  complex_name:       '',
  location:           '',
  pyeong:             '',
  construction_cost:  '900',
  member_name:        '',
};

function formatAmount(eokValue) {
  if (eokValue == null || Number.isNaN(eokValue)) return '—';
  const manwon = Math.round(eokValue * 10000);
  if (manwon >= 10000) return `${eokValue.toFixed(1)}억 원`;
  return `${manwon.toLocaleString()}만 원`;
}

function formatRepayDuration(eokValue) {
  if (eokValue == null || Number.isNaN(eokValue)) return '—';
  const months = Math.round(eokValue * 10000 / 100);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainder = months % 12;
    return remainder > 0 ? `${years}년 ${remainder}개월` : `${years}년`;
  }
  return `${months}개월`;
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
  const [phone, setPhone]                               = useState('');
  const [isModalPrivacyAgreed, setIsModalPrivacyAgreed] = useState(false);
  const [pendingNav, setPendingNav]         = useState(null);
  const [modalSource, setModalSource]       = useState('report');
  const [step, setStep]                     = useState(1);
  const [toast, setToast]                   = useState(null);
  const [detailOpen, setDetailOpen]         = useState(false);

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
      setModalSource('report');
      setPendingNav(href);
      setEmailModalOpen(true);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  // 비현실적 값 경고
  const warnings = [];
  if (Number(form.expected_extra) > 50) warnings.push('추가 분담금이 50억을 초과합니다. 단위가 억원인지 확인해 주세요.');
  if (Number(form.asset_value) > 100) warnings.push('종전자산이 100억을 초과합니다. 단위가 억원인지 확인해 주세요.');
  if (Number(form.cost_increase_rate) > 100) warnings.push('공사비 상승률이 100%를 초과합니다. 입력값을 확인해 주세요.');
  if (Number(form.construction_cost) > 2000) warnings.push('평당 공사비가 2,000만원을 초과합니다. 입력값을 확인해 주세요.');

  const betaMode = isBetaMode();
  const isStep1Valid =
    form.expected_extra     !== '' && Number(form.expected_extra)     > 0 &&
    form.asset_value        !== '' && Number(form.asset_value)        > 0 &&
    form.cost_increase_rate !== '' && Number(form.cost_increase_rate) >= 0;
  const isStep2Valid =
    form.complex_name.trim()  !== '' &&
    form.location.trim()      !== '' &&
    form.pyeong             !== '' && Number(form.pyeong)             > 0 &&
    form.construction_cost  !== '' && Number(form.construction_cost)  > 0 &&
    (betaMode || form.member_name.trim() !== '');

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
          complex_name:       form.complex_name.trim(),
          location:           form.location.trim(),
          pyeong:             Number(form.pyeong),
          construction_cost:  Number(form.construction_cost),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '분석 중 오류가 발생했습니다. 입력값을 확인하고 다시 시도해 주세요.');

      setResult(data);

      // Save context for /member/report-basic|premium (결제 시 PDF 생성에 필요한 전체 데이터 보존)
      try {
        localStorage.setItem('basicReportContext', JSON.stringify({
          assetValue:       form.asset_value,
          expectedExtra:    form.expected_extra,
          riskGrade:        data.risk_level,
          complexName:      form.complex_name.trim()      || null,
          location:         form.location.trim()          || null,
          constructionCost: Number(form.construction_cost) || null,
          memberName:       form.member_name.trim()       || null,
        }));
      } catch {}

      setTimeout(() => {
        document.getElementById('shock-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

  async function handleBetaSubmit(emailAddress, phoneNumber) {
    setBetaLoading(true);
    try {
      const res = await fetch('/api/member-beta-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:             emailAddress,
          phone:             phoneNumber || undefined,
          source:            modalSource === 'result' ? 'calc_result' : 'calc_cta',
          asset_value:       Number(form.asset_value)       || null,
          expected_extra:    Number(form.expected_extra)    || null,
          risk_grade:        result?.risk_level             || null,
          complex_name:      form.complex_name.trim()       || null,
          location:          form.location.trim()           || null,
          pyeong:            Number(form.pyeong)            || null,
          construction_cost: Number(form.construction_cost) || null,
        }),
      });
      if (!res.ok) throw new Error('신청에 실패했습니다.');
      setBetaDone(true);
      setToast('사전 신청이 완료되었습니다. 6월 출시 시 이메일로 먼저 안내드립니다.');
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setPdfError(err.message ?? '신청에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBetaLoading(false);
    }
  }

  const PHONE_DISPLAY_RE = /^01[016789]-\d{3,4}-\d{4}$/;

  function formatPhoneInput(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4)  return digits;
    if (digits.length < 8)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!phone || !PHONE_DISPLAY_RE.test(phone)) {
      setEmailError('휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)');
      return;
    }
    if (!isModalPrivacyAgreed) {
      setEmailError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    setEmailModalOpen(false);
    // pendingNav: navigate after beta submit via useEffect
    if (isBetaMode()) {
      handleBetaSubmit(email.trim(), phone || undefined);
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
        <p className={styles.eyebrow}>M-DEENO</p>
        <h1 className={styles.title}>
          내 분담금,<br />정밀 진단받기
        </h1>
        <p className={styles.subtitle}>
          자산 잠식률 · 위험 등급 · 공사비 벤치마크까지<br />
          전문가 수준으로 즉시 분석합니다.
        </p>
        <p className={styles.privacyNotice}>
          입력하신 정보는 분석에만 사용되며, 외부에 공유되지 않습니다.
        </p>
      </div>

      <div className={styles.formLayout}>
        {/* ── 동기부여 사이드바 (데스크톱: 우측 / 모바일: 상단) ── */}
        <aside className={styles.motivationSidebar}>
          <div className={styles.motivationCard}>
            <h3 className={styles.motivationTitle}>왜 분석해야 하나요?</h3>
            <p className={styles.motivationText}>
              공사비 10% 상승 시 분담금이<br />
              <strong>2.5~7.0배</strong>까지 증가할 수 있습니다.
            </p>
            <p className={styles.motivationStat}>
              전국 2,424개 단지 조합원이 같은 고민을 하고 있습니다.
            </p>
          </div>
          <div className={styles.motivationCard}>
            <h3 className={styles.motivationTitle}>분석하면 이걸 알 수 있습니다</h3>
            <ul className={styles.motivationList}>
              <li>내 위험 등급 (R1~R4)</li>
              <li>공사비 상승 시 추가 분담금 예상액</li>
              <li>자산이 위험해지는 정확한 시점</li>
              <li>총회에서 해야 할 질문 5가지</li>
            </ul>
          </div>
        </aside>

        {/* ── 폼 영역 ── */}
        <div className={styles.formArea}>

      {/* ── Input Form ── */}
      <div id="calc-form-top" />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>

        {/* ── 진행 표시 ── */}
        <div className={styles.stepProgress}>
          <div className={styles.stepItem}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''} ${step > 1 ? styles.stepDotDone : ''}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`${styles.stepLabel} ${step === 1 ? styles.stepLabelActive : ''} ${step > 1 ? styles.stepLabelDone : ''}`}>자산 정보</span>
          </div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineCompleted : ''}`} />
          <div className={styles.stepItem}>
            <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`}>2</div>
            <span className={`${styles.stepLabel} ${step === 2 ? styles.stepLabelActive : ''}`}>단지 정보</span>
          </div>
        </div>

        {/* ── 비현실적 값 경고 ── */}
        {warnings.length > 0 && (
          <div className={styles.warningBox}>
            {warnings.map((w) => <p key={w} className={styles.warningText}>{w}</p>)}
          </div>
        )}

        {/* ── Step 1: 자산 정보 ── */}
        {step === 1 && (
          <div className={`${styles.formCard} ${styles.formCardActive}`}>
            <p className={styles.formSectionLabel}>
              <span className={styles.stepBadge}>1단계</span>
              자산 정보 입력
            </p>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="expected_extra">
                  예상 추가 분담금 <span className={styles.req}>*</span>
                </label>
                <p id="expected_extra_hint" className={styles.fieldHint}>조합이 통보한 추가 분담금 예정액입니다. 조합 안내문·총회 자료에 기재되어 있습니다. 모르시면 조합 사무실에 문의하세요.</p>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    id="expected_extra"
                    name="expected_extra"
                    type="number"
                    value={form.expected_extra}
                    onChange={handleChange}
                    placeholder="예: 1.5 (1억 5천만원)"
                    min="0.1"
                    step="0.1"
                    required
                    aria-required="true"
                    aria-describedby="expected_extra_hint"
                  />
                  <span className={styles.unit}>억원</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="asset_value">
                  종전자산 평가액 <span className={styles.req}>*</span>
                </label>
                <p id="asset_value_hint" className={styles.fieldHint}>감정평가서 또는 관리처분계획서에 적힌 '종전자산평가액'입니다. 조합에서 받은 공문이나 우편물을 확인하세요.</p>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    id="asset_value"
                    name="asset_value"
                    type="number"
                    value={form.asset_value}
                    onChange={handleChange}
                    placeholder="예: 5.0 (5억원)"
                    min="0.1"
                    step="0.1"
                    required
                    aria-required="true"
                    aria-describedby="asset_value_hint"
                  />
                  <span className={styles.unit}>억원</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="cost_increase_rate">
                  예상 공사비 상승률 <span className={styles.req}>*</span>
                </label>
                <p id="cost_increase_rate_hint" className={styles.fieldHint}>공사비가 오르면 분담금이 얼마나 늘어나는지 분석합니다. 시공사가 요청한 인상률 기준이며, 모르시면 10을 입력하세요.</p>
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
                    required
                    aria-required="true"
                    aria-describedby="cost_increase_rate_hint"
                  />
                  <span className={styles.unit}>%</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="project_stage">
                  현재 사업 단계 <span className={styles.req}>*</span>
                </label>
                <p id="project_stage_hint" className={styles.fieldHint}>조합 공문이나 안내문에서 현재 진행 단계를 확인하세요. 단계가 뒤로 갈수록 위험도가 높아집니다.</p>
                <select
                  className={styles.input}
                  id="project_stage"
                  name="project_stage"
                  value={form.project_stage}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby="project_stage_hint"
                >
                  {STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className={styles.nextBtn}
              type="button"
              disabled={!isStep1Valid}
              onClick={() => {
                setStep(2);
                setTimeout(() => {
                  document.getElementById('calc-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            >
              다음 단계 →
            </button>
            {!isStep1Valid && (
              <p className={styles.stepHint}>위 항목을 모두 입력하면 다음 단계로 진행됩니다</p>
            )}
          </div>
        )}

        {/* ── Step 2: 단지 정보 ── */}
        {step === 2 && (
          <div className={`${styles.formCard} ${styles.formCardActive}`}>
            <p className={styles.formSectionLabel}>
              <span className={styles.stepBadge}>2단계</span>
              단지 정보
            </p>
            <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
              지역별 공사비 벤치마크 비교와 맞춤 분석에 사용됩니다
            </p>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="complex_name">
                  아파트 단지명 <span className={styles.req}>*</span>
                </label>
                <p id="complex_name_hint" className={styles.fieldHint}>정비사업이 진행 중인 아파트 단지명을 입력하세요. 예: 은마아파트, 목동 7단지</p>
                <input
                  className={styles.input}
                  id="complex_name"
                  name="complex_name"
                  type="text"
                  value={form.complex_name}
                  onChange={handleChange}
                  placeholder="단지명을 입력해주세요"
                  required
                  aria-required="true"
                  aria-describedby="complex_name_hint"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="location">
                  사업장 지역 <span className={styles.req}>*</span>
                </label>
                <p id="location_hint" className={styles.fieldHint}>지역별 공사비 비교에 사용됩니다. 예: 서울 강남구, 경기 분당구</p>
                <input
                  className={styles.input}
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="00시 00구를 입력해주세요"
                  required
                  aria-required="true"
                  aria-describedby="location_hint"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pyeong">
                  내 아파트 평형 <span className={styles.req}>*</span>
                </label>
                <p id="pyeong_hint" className={styles.fieldHint}>등기부등본이나 분양계약서에 적힌 전용면적을 평으로 환산하세요. (㎡ ÷ 3.3 = 평)</p>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    id="pyeong"
                    name="pyeong"
                    type="number"
                    value={form.pyeong}
                    onChange={handleChange}
                    placeholder="예: 25"
                    min="1"
                    step="1"
                    required
                    aria-required="true"
                    aria-describedby="pyeong_hint"
                  />
                  <span className={styles.unit}>평</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="construction_cost">
                  평당 공사비 <span className={styles.req}>*</span>
                </label>
                <p id="construction_cost_hint" className={styles.fieldHint}>시공사 계약서나 조합 공문에 적힌 평당 공사비입니다. (상승 전 금액) 모르시면 900을 입력하세요.</p>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    id="construction_cost"
                    name="construction_cost"
                    type="number"
                    value={form.construction_cost}
                    onChange={handleChange}
                    placeholder="예: 900"
                    min="1"
                    step="10"
                    required
                    aria-required="true"
                    aria-describedby="construction_cost_hint"
                  />
                  <span className={styles.unit}>만원/평</span>
                </div>
              </div>

              {/* 리포트 개인화 — 비베타 전용 */}
              {!betaMode && (
                <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label} htmlFor="member_name">
                    조합원 이름 <span className={styles.req}>*</span>
                  </label>
                  <p id="member_name_hint" className={styles.fieldHint}>PDF 리포트 표지에 표시됩니다</p>
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
                    aria-required="true"
                    aria-describedby="member_name_hint"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorBox} role="alert" style={{ marginTop: '16px' }}>
                {error}
                <br />
                <span style={{ fontSize: '0.85em', opacity: 0.85 }}>문의: help@mdeeno.com</span>
              </div>
            )}

            <p className={styles.privacyNote} style={{ marginTop: '16px', marginBottom: '12px' }}>
              🔒 입력하신 자산 정보는 암호화되어 안전하게 처리됩니다.
            </p>

            <div className={styles.stepNavRow}>
              <button
                className={styles.backBtn}
                type="button"
                onClick={() => setStep(1)}
              >
                ← 이전
              </button>
              <button className={styles.submitBtn} type="submit" disabled={loading || !isStep2Valid}>
                {loading ? (
                  <span className={styles.loadingInner}>
                    <span className={styles.spinner} />
                    분석 중...
                  </span>
                ) : (
                  '내 분담금 위험도 분석하기'
                )}
              </button>
            </div>
            {!isStep2Valid && !loading && (
              <p className={styles.stepHint}>위 항목을 모두 입력하면 분석을 시작할 수 있습니다</p>
            )}
          </div>
        )}

      </form>

        </div>{/* end formArea */}
      </div>{/* end formLayout */}

      {/* ── Shock Result ── */}
      {result && (
        <div id="shock-result" className={styles.resultSection}>

          {/* ── 핵심 요약 (항상 보임) ── */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span className={`${styles.riskBadge} ${styles[`riskBadge${result.risk_level}`]}`}>
                {result.risk_level}
              </span>
              <span className={styles.summaryGrade}>
                {RISK_LABELS[result.risk_level]} 등급
              </span>
            </div>
            <p className={styles.summaryAmount}>{formatAmount(result.expected_contribution)}</p>
            <p className={styles.summaryDuration}>
              월 100만 원씩 <strong>{formatRepayDuration(result.expected_contribution)}</strong>
            </p>
            <p className={styles.summarySub}>
              자산 잠식률 {(result.expected_contribution / Number(form.asset_value) * 100).toFixed(1)}%
              {result.next_grade_info && (
                <> · 공사비 {result.next_grade_info.additional_rate}% 더 오르면 <strong>{result.next_grade_info.next_grade}</strong> 등급</>
              )}
            </p>
            {result.comparison_contribution < result.expected_contribution && (
              <p className={styles.summaryReduction}>전략 적용 시 절감 가능</p>
            )}
          </div>

          {/* ── 상세 분석 (접기/펼치기) ── */}
          <button
            className={styles.detailToggle}
            type="button"
            onClick={() => setDetailOpen((prev) => !prev)}
          >
            {detailOpen ? '상세 분석 접기 ▲' : '상세 분석 보기 ▼'}
          </button>

          {detailOpen && (
            <div className={styles.detailSection}>
              {/* Shock Message */}
              <div className={styles.shockBox}>
                <p className={styles.shockMessage}>{result.shock_message}</p>
              </div>

              {/* Benchmark Warning */}
              {result.benchmark_warning && result.benchmark_status !== 'normal' && result.benchmark_status !== 'unknown' && (
                <div className={result.benchmark_status === 'high' ? styles.benchmarkHigh : styles.benchmarkLow}>
                  <p className={styles.benchmarkText}>{result.benchmark_warning}</p>
                  <p className={styles.benchmarkSource}>
                    출처: (사)주거환경연구원 실태조사 (2024년 실측) + 언론·업계 전망 보정 (2026년 기준) ※ 시·도별 공식 통계 미존재, 참고용 추정값
                  </p>
                </div>
              )}

              {/* Threshold Warning */}
              {result.next_grade_info && (
                <div className={styles.thresholdWarning}>
                  <p className={styles.thresholdText}>
                    공사비가 <strong>{result.next_grade_info.additional_rate}%</strong> 더 오르면{' '}
                    위험 등급이 <strong>{result.next_grade_info.next_grade}</strong>({RISK_LABELS[result.next_grade_info.next_grade]})로 악화됩니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Risk-based Tier Recommendation */}
          <div className={
            ['R1', 'R2'].includes(result.risk_level)
              ? styles.tierRecommendBasic
              : styles.tierRecommendPremium
          }>
            <p className={styles.tierRecommendTitle}>
              {['R1', 'R2'].includes(result.risk_level)
                ? `${RISK_LABELS[result.risk_level]} 등급 — 베이직 리포트로 충분히 대응 가능합니다`
                : `${RISK_LABELS[result.risk_level]} 등급 — 프리미엄 전략 리포트가 필요합니다`}
            </p>
            <p className={styles.tierRecommendDesc}>
              {['R1', 'R2'].includes(result.risk_level)
                ? '자산 구조 검증과 총회 질문 5개를 담은 베이직 리포트로 핵심 리스크를 확인하세요.'
                : '협상 전략·총회 발언 스크립트·행동 타임라인이 포함된 프리미엄 리포트로 총회에서 이기세요.'}
            </p>
            <Link
              href={['R1', 'R2'].includes(result.risk_level) ? '/reports#basic' : '/reports#premium'}
              className={styles.tierSampleLink}
            >
              리포트 샘플 먼저 확인하기 →
            </Link>
          </div>

          {/* 5. Report TOC + CTA */}
          <div className={styles.strategyWrap}>
            <div className={styles.reportToc}>
              <p className={styles.reportTocTitle}>리포트에 포함된 내용</p>
              <ul className={styles.reportTocList}>
                {['R3', 'R4'].includes(result.risk_level) ? (
                  <>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 자산 구조 정밀 분석 (잠식률·분담금 시나리오)</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 공사비 협상 전략 및 원가 검증 포인트</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 총회 발언 스크립트 (즉시 활용 가능)</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 시공사 대응 전략 및 협상 질문 리스트</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 감정평가 대응 및 재평가 요구 근거</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 행동 타임라인 (총회 전·중·후)</li>
                  </>
                ) : (
                  <>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 자산 구조 검증 리포트</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 분담금 시나리오 분석</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 총회 핵심 질문 5가지</li>
                    <li className={styles.reportTocItem}><span className={styles.tocCheck}>✓</span> 공사비 벤치마크 비교</li>
                  </>
                )}
              </ul>
            </div>
            <div className={styles.strategyOverlay}>
              <p className={styles.premiumHeadline}>
                위험을 확인했다면<br />대응 전략이 필요합니다
              </p>
              {!isBetaMode() && (
                <p className={styles.ctaPrice}>
                  <span className={styles.ctaPriceBeta}>출시 특가 99,000원 · 정가 149,000원</span>
                </p>
              )}

              {pdfError && (
                <p className={styles.ctaError}>{pdfError}</p>
              )}

              {isBetaMode() ? (
                <>
                  <button
                    className={styles.ctaBtn}
                    onClick={() => { if (!betaDone) { setModalSource('report'); setEmailModalOpen(true); } }}
                    disabled={betaLoading || betaDone}
                  >
                    {betaLoading ? (
                      <span className={styles.ctaBtnInner}>
                        <span className={styles.ctaSpinner} />
                        신청 처리 중...
                      </span>
                    ) : betaDone ? (
                      '사전 신청 완료 ✓'
                    ) : (
                      '사전 신청하기 →'
                    )}
                  </button>
                  <p className={styles.ctaNote}>
                    {betaDone
                      ? '신청이 완료되었습니다. 6월 정식 출시 시 이메일로 먼저 안내드립니다.'
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
                <Link href={href} className={styles.basicReportCtaBtn}>
                  {isLowRisk ? '프리미엄 전략 리포트 보기 →' : '베이직 리포트 보기 →'}
                </Link>
              </div>
            );
          })()}

        </div>
      )}

      <p className={styles.disclaimer}>
        * 본 분석 결과는 입력값 기반 시뮬레이션으로, 법적 증거로 사용될 수 없습니다.
      </p>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>✓</span>
          {toast}
        </div>
      )}

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
              {isBetaMode() ? '출시 알림 · 사전 신청' : '리포트를 받을 이메일'}
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
                  onBlur={() => {
                    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                      setEmailError('올바른 이메일 주소를 입력해 주세요.');
                  }}
                  placeholder="이메일 주소를 입력해 주세요"
                  autoComplete="email"
                  autoFocus
                  aria-required="true"
                  aria-invalid={emailError ? 'true' : undefined}
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="modal_phone">
                  휴대폰 번호
                </label>
                <input
                  className={styles.modalInput}
                  id="modal_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(formatPhoneInput(e.target.value)); setEmailError(''); }}
                  onBlur={() => {
                    if (phone && !PHONE_DISPLAY_RE.test(phone))
                      setEmailError('휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)');
                  }}
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  inputMode="numeric"
                  required
                  aria-required="true"
                  aria-invalid={emailError ? 'true' : undefined}
                  aria-describedby="modal_phone_hint"
                />
                <p id="modal_phone_hint" className={styles.modalPhoneHint}>서비스 오픈 시 알림톡으로 먼저 안내해 드립니다</p>
              </div>

              <label className={styles.modalPrivacyRow}>
                <input
                  type="checkbox"
                  checked={isModalPrivacyAgreed}
                  onChange={(e) => { setIsModalPrivacyAgreed(e.target.checked); setEmailError(''); }}
                />
                <span className={styles.modalPrivacyText}>
                  개인정보 수집·이용에 동의합니다 (이메일·휴대폰 번호 수집, 출시 안내 목적)
                </span>
              </label>

              {emailError && (
                <p className={styles.modalError}>{emailError}</p>
              )}

              <button className={styles.modalSubmitBtn} type="submit">
                {isBetaMode() ? '사전 신청하기' : '리포트 생성하기'}
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
