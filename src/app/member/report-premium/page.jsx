'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isBetaMode } from '@/lib/feature-flags';
import AssetShockCard from '@/components/report/AssetShockCard';
import styles from './page.module.css';

const NEGOTIATION_REDUCTION = 0.22;
const COST_INCREASE_RATE    = 0.10;

function calcSavings(expectedExtra) {
  const expected_contribution   = expectedExtra * (1 + COST_INCREASE_RATE);
  const comparison_contribution = expected_contribution * (1 - NEGOTIATION_REDUCTION);
  return Math.round((expected_contribution - comparison_contribution) * 10000);
}

const RISK_COLOR = { R1: 'var(--success)', R2: 'var(--warning)', R3: 'var(--danger)', R4: 'var(--danger)' };
const RISK_LABEL = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };

export default function PremiumReportPaywall() {
  const router = useRouter();
  const [email, setEmail]                   = useState('');
  const [emailError, setEmailError]         = useState('');
  const [phone, setPhone]                   = useState('');
  const [phoneError, setPhoneError]         = useState('');
  const [submitted, setSubmitted]           = useState(false);
  const [loading, setLoading]               = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isRefundAgreed, setIsRefundAgreed]   = useState(false);
  const [savings, setSavings]               = useState(null);
  const [shareCopied, setShareCopied]       = useState(false);
  const [context, setContext]               = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [leadCount, setLeadCount]           = useState(null);
  const [trafficSource, setTrafficSource]   = useState({});
  const [submitError, setSubmitError]       = useState('');

  function handleShare() {
    const id = crypto.randomUUID();
    localStorage.setItem(`share_${id}`, JSON.stringify({ type: 'premium' }));
    const url = `${window.location.origin}/report/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset');
    const extraParam = params.get('extra');
    const gradeParam = params.get('grade');

    try {
      if (assetParam && extraParam && gradeParam) {
        // localStorage에 저장된 context(단지명·지역·공사비·이름)를 먼저 읽어서 병합
        // URL params로 덮어쓰면 계산기에서 입력한 데이터가 사라지는 버그 방지
        let storedContext = {};
        try {
          const raw = localStorage.getItem('basicReportContext');
          if (raw) storedContext = JSON.parse(raw);
        } catch {}
        const ctx = {
          ...storedContext,
          assetValue:    assetParam,
          expectedExtra: extraParam,
          riskGrade:     gradeParam,
        };
        setContext(ctx);
        if (Number(extraParam) > 0) setSavings(calcSavings(Number(extraParam)));
        try { localStorage.setItem('basicReportContext', JSON.stringify(ctx)); } catch {}
      } else {
        const raw = localStorage.getItem('basicReportContext');
        if (raw) {
          const parsed = JSON.parse(raw);
          setContext(parsed);
          if (parsed.expectedExtra && Number(parsed.expectedExtra) > 0) {
            setSavings(calcSavings(Number(parsed.expectedExtra)));
          }
        } else {
          router.push('/member');
          return;
        }
      }
    } catch {}
    setContextLoading(false);

    fetch('/api/lead-count')
      .then((r) => r.json())
      .then((d) => setLeadCount(d.count))
      .catch(() => {});

    setTrafficSource({
      utm_source:   params.get('utm_source')   ?? null,
      utm_campaign: params.get('utm_campaign') ?? null,
      referrer:     document.referrer || null,
    });
  }, []);

  const PHONE_RE = /^010\d{7,8}$/;

  function formatPhoneInput(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4)  return digits;
    if (digits.length < 8)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  const erosionRate = context
    ? ((Number(context.expectedExtra) / Number(context.assetValue)) * 100).toFixed(1)
    : null;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = PHONE_RE.test(phone.replace(/\D/g, ''));
  const isCTADisabled = loading || !isPrivacyAgreed || (!isBetaMode() && !isRefundAgreed) || !isEmailValid || !isPhoneValid;

  async function handlePurchase(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || !PHONE_RE.test(cleanPhone)) {
      setPhoneError('휴대폰 번호를 입력해주세요. (예: 01012345678)');
      return;
    }
    setLoading(true);

    const trafficStr = JSON.stringify(trafficSource);
    const leadBody = {
      email:          email.trim(),
      phone:          cleanPhone,
      asset_value:    context ? Number(context.assetValue)    : null,
      expected_extra: context ? Number(context.expectedExtra) : null,
      risk_grade:     context?.riskGrade ?? null,
      traffic_source: trafficStr,
    };

    setSubmitError('');

    if (isBetaMode()) {
      try {
        const res = await fetch('/api/lead-submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...leadBody, product_type: 'premium_beta', beta: true }),
        });
        if (!res.ok) throw new Error('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
        setSubmitted(true);
      } catch (err) {
        setSubmitError(err.message ?? '신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/payments/prepare', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:             email.trim(),
          phone:             cleanPhone,
          product_type:      'premium',
          asset_value:       context ? Number(context.assetValue)       : null,
          expected_extra:    context ? Number(context.expectedExtra)    : null,
          risk_grade:        context?.riskGrade                         ?? null,
          complex_name:      context?.complexName                       ?? null,
          location:          context?.location                          ?? null,
          construction_cost: context?.constructionCost                  ?? null,
          member_name:       context?.memberName                        ?? null,
          traffic_source:    trafficStr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '결제 준비에 실패했습니다.');

      const tossKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!tossKey) throw new Error('결제 설정이 완료되지 않았습니다. 고객센터로 문의해 주세요.');
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const toss = await loadTossPayments(tossKey);
      await toss.requestPayment({
        method:        '카드',
        amount:        { currency: 'KRW', value: data.amount },
        orderId:       data.orderId,
        orderName:     data.orderName,
        customerEmail: data.customerEmail,
        customerName:  data.customerName,
        successUrl:    data.successUrl,
        failUrl:       data.failUrl,
      });
    } catch (err) {
      setSubmitError(err.message ?? '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loadingText}>분석 결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>

      {/* ── 1. 헤더 ── */}
      <section className={styles.intro}>
        <p className={styles.eyebrow}>M-DEENO 프리미엄 전략 리포트</p>
        <h1 className={styles.title}>총회 전, 수천만원을<br />지킬 수 있습니다</h1>
        <p className={styles.subtitle}>
          20페이지 이상 심층 분석 · 협상 전략 · 총회 발언 스크립트 · 행동 플랜
        </p>
        <ul className={styles.featureList}>
          <li>공사비 시나리오별 자산 잠식 구간 정밀 분석</li>
          <li>협상 전략 적용 시 예상 절감액 시뮬레이션</li>
          <li>총회 발언 스크립트 및 검증 질문 리스트</li>
          <li>조합 대응 타임라인 (30일 행동 플랜)</li>
          <li>사업 구조 분석 및 원가 검증 방법</li>
        </ul>
      </section>

      {/* ── 2. 내 분석 결과 + 절감 시뮬레이션 ── */}
      {context && (
        <section className={styles.contextSection}>
          <div className={styles.contextCard}>
            <p className={styles.contextLabel}>내 분석 결과</p>
            <div className={styles.contextGrade} style={{ color: RISK_COLOR[context.riskGrade] }}>
              {context.riskGrade}
              <span className={styles.contextGradeLabel}>{RISK_LABEL[context.riskGrade]}</span>
            </div>
            <div className={styles.contextRow}>
              <div className={styles.contextItem}>
                <span>종전자산</span>
                <strong>{context.assetValue}억원</strong>
              </div>
              <div className={styles.contextItem}>
                <span>예상 추가 분담금</span>
                <strong>{context.expectedExtra}억원</strong>
              </div>
            </div>
          </div>

          {savings !== null && (
            <div className={styles.savingsBlock}>
              <p className={styles.savingsLabel}>협상 전략 적용 시 예상 절감액</p>
              <div className={styles.savingsNumber}>-{savings.toLocaleString()}만원</div>
              <p className={styles.savingsNote}>공사비 10% 상승 시나리오 · 협상 성공 시 22% 절감 기준</p>
            </div>
          )}
        </section>
      )}

      {/* ── 3. 리포트 미리보기 ── */}
      <section className={styles.previewSection}>
        <p className={styles.previewLabel}>리포트 미리보기</p>

        {/* P1 — Cover */}
        <div className={`${styles.reportPage} ${styles.reportPageDark}`}>
          <div className={styles.accentBar} />
          <p className={styles.pageLogoLight}>M — DEENO · Prop-Logic™</p>
          <p className={styles.pageEyebrowLight}>조합원 전략 리포트</p>
          <h2 className={styles.pageTitleLight}>
            재건축 공사비 리스크<br />총회 대응 전략 패키지
          </h2>
          <div className={styles.pageMeta}>
            <span>분석 단지: OO아파트</span>
            <span>수신인: 홍길동 조합원</span>
            <span>발행일: 2026.03.05</span>
          </div>
          <span className={`${styles.riskBadge} ${styles.badgeR3}`}>R3 — 고위험</span>
        </div>

        {/* P2 — Executive Summary */}
        <div className={styles.reportPage}>
          <p className={styles.pageEyebrow}>EXECUTIVE SUMMARY</p>
          <h3 className={styles.pageSectionTitle}>핵심 위험 지표</h3>
          <div className={styles.shockNumber}>+1,200만원</div>
          <p className={styles.shockLabel}>공사비 10% 상승 시 추가 예상 손실</p>
          <div className={styles.metricRow}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>자산 잠식률</span>
              <span className={`${styles.metricValue} ${styles.valueDanger}`}>24.0%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>위험 등급</span>
              <span className={`${styles.metricValue} ${styles.valueWarn}`}>R3</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>협상 절감 가능</span>
              <span className={`${styles.metricValue} ${styles.valueSafe}`}>~264만원</span>
            </div>
          </div>
        </div>

        {/* P3 — 협상 절감 시뮬레이션 */}
        <div className={styles.reportPage}>
          <p className={styles.pageEyebrow}>SECTION 02</p>
          <h3 className={styles.pageSectionTitle}>협상 절감 시뮬레이션</h3>
          <table className={styles.previewTable}>
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
          <p className={styles.previewNote}>세부 협상 스크립트 및 실행 가이드는 리포트 전문에 수록</p>
        </div>

        {/* P4 — 발언 스크립트 부분 공개 */}
        <div className={styles.reportPage}>
          <p className={styles.pageEyebrow}>SECTION 03</p>
          <h3 className={styles.pageSectionTitle}>총회 발언 스크립트 5종</h3>

          {/* 스크립트 목차 */}
          <ol className={styles.scriptIndex}>
            <li className={styles.scriptIndexItem}>
              <span className={styles.scriptIndexNum}>01</span>
              <span className={styles.scriptIndexTitle}>오프닝 — 공사비 원가 공개 요구</span>
              <span className={styles.scriptIndexTag}>미리보기</span>
            </li>
            {[
              '공사비 인상 근거 질의 — 시나리오별 분담금 변화',
              '감정평가 재검토 요구 — 종전자산 적정성 문제 제기',
              '집단 의견 표명 — 충분한 설명·자료 제공 요구',
              '표결 전 발언 — 독립 원가 검증 선행 요청',
            ].map((title, i) => (
              <li key={title} className={`${styles.scriptIndexItem} ${styles.scriptIndexItemLocked}`}>
                <span className={styles.scriptIndexNum}>0{i + 2}</span>
                <span className={styles.scriptIndexTitle}>{title}</span>
                <span className={styles.scriptIndexLock}>🔒</span>
              </li>
            ))}
          </ol>

          <div className={styles.scriptBox}>
            <p className={styles.scriptLabel}>발언 오프닝 — 공사비 원가 공개 요구</p>
            <p className={styles.scriptText}>
              &ldquo;조합장님, 저는 금번 총회 안건에 앞서 한 가지를 공식적으로
              요청드립니다. 시공사가 제시한 평당 공사비 산출 내역서를 조합원 전원이
              확인할 수 있도록 공개해 주시기 바랍니다.&rdquo;
            </p>
          </div>
          <div className={styles.partialBlur}>
            <div className={styles.blurContent}>
              <div className={styles.blurLine} />
              <div className={styles.blurLine} />
              <div className={styles.blurLineShort} />
            </div>
            <div className={styles.blurOverlay}>
              <p className={styles.blurOverlayText}>나머지 4종 스크립트 전문은 구매 후 확인 가능합니다.</p>
            </div>
          </div>
        </div>

        {/* P5 — 전체 블러 */}
        <div className={`${styles.reportPage} ${styles.reportPageBlur}`}>
          <div className={styles.blurContent}>
            <p className={styles.pageEyebrow}>SECTION 04</p>
            <h3 className={styles.pageSectionTitle}>행동 타임라인 및 사후 대응 전략</h3>
            <div className={styles.blurLine} />
            <div className={styles.blurLine} />
            <div className={styles.blurLineShort} />
          </div>
          <div className={styles.blurOverlay}>
            <p className={styles.blurOverlayText}>전체 전략 리포트는 구매 후 확인 가능합니다.</p>
          </div>
        </div>
      </section>

      {/* ── 5. AssetShockCard ── */}
      {context && (
        <AssetShockCard
          assetValue={Number(context.assetValue)}
          expectedExtra={Number(context.expectedExtra)}
          riskGrade={context.riskGrade}
        />
      )}

      {/* ── 6. CTA ── */}
      <section className={styles.ctaSection}>
        {submitted ? (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>사전 신청이 완료되었습니다 ✓</p>
            <p className={styles.successDesc}>
              6월 정식 출시 시 출시 특가 결제 링크를 이메일로 보내드립니다.
            </p>
            <Link href="/member" className={styles.successCalcBtn}>
              다시 계산해보기 →
            </Link>
          </div>
        ) : (
          <form className={styles.ctaForm} onSubmit={handlePurchase} noValidate>
            {isBetaMode() && (
              <div className={styles.betaBadge}>
                🚧 사전 신청 진행 중 · 6월 정식 출시 예정
              </div>
            )}

            <h2 className={styles.ctaTitle}>
              {isBetaMode() ? '프리미엄 사전 신청' : '프리미엄 전략 리포트 구매'}
            </h2>

            {!isBetaMode() && (
              <div className={styles.ctaPriceRow}>
                <span className={styles.ctaPriceFinal}>99,000원</span>
                <span className={styles.ctaPriceOriginal}>정가 149,000원</span>
                <span className={styles.ctaPriceBadge}>출시 특가</span>
              </div>
            )}

            {leadCount !== null && leadCount > 0 && (
              <p className={styles.socialProof}>
                현재 {leadCount.toLocaleString()}명의 조합원이 분석을 완료했습니다
              </p>
            )}

            <input
              className={`${styles.ctaInput}${emailError ? ` ${styles.ctaInputError}` : ''}`}
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={() => {
                if (email.trim() && !isEmailValid) setEmailError('올바른 이메일 주소를 입력해 주세요.');
              }}
              autoComplete="email"
            />
            {emailError && <p className={styles.ctaError}>{emailError}</p>}

            <input
              className={`${styles.ctaInput}${phoneError ? ` ${styles.ctaInputError}` : ''}`}
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => { setPhone(formatPhoneInput(e.target.value)); setPhoneError(''); }}
              onBlur={() => {
                if (phone && !isPhoneValid) setPhoneError('휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)');
              }}
              autoComplete="tel"
              inputMode="numeric"
            />
            {phoneError && <p className={styles.ctaError}>{phoneError}</p>}

            <div className={styles.consentBox}>
              <label className={styles.consentLabel}>
                <input type="checkbox" checked={isPrivacyAgreed} onChange={(e) => setIsPrivacyAgreed(e.target.checked)} />
                <span>[필수] 개인정보 수집 및 이용 동의 (이메일·휴대폰 번호: 출시 안내 및 서비스 알림)</span>
              </label>
              {!isBetaMode() && (
                <label className={styles.consentLabel}>
                  <input type="checkbox" checked={isRefundAgreed} onChange={(e) => setIsRefundAgreed(e.target.checked)} />
                  <span>[필수] 디지털 상품 특성상 다운로드 이후 환불 불가에 동의</span>
                </label>
              )}
            </div>

            {submitError && (
              <p className={styles.ctaError} role="alert">{submitError}</p>
            )}

            <button
              className={styles.ctaBtn}
              type="submit"
              disabled={isCTADisabled}
            >
              {loading ? '처리 중...' : isBetaMode() ? '사전 신청하기' : '프리미엄 전략 리포트 구매하기 →'}
            </button>
            {isCTADisabled && !loading && (
              <p className={styles.ctaHint}>
                {!isEmailValid
                  ? '이메일을 입력해 주세요'
                  : !isPhoneValid
                  ? '휴대폰 번호를 입력해 주세요'
                  : '위 동의 항목을 체크하면 신청 버튼이 활성화됩니다'}
              </p>
            )}

            <p className={styles.ctaNote}>
              {isBetaMode()
                ? '6월 정식 출시 이후 결제 링크를 이메일로 발송합니다'
                : '결제 완료 즉시 입력하신 이메일로 PDF가 발송됩니다'}
            </p>

            <p className={styles.ctaGuarantee}>
              리포트 품질에 만족하지 못하실 경우 help@mdeeno.com으로 사유를 보내주시면 검토 후 안내드립니다.
            </p>

            <p className={styles.ctaDisclaimer}>
              본 리포트는 참고용 분석 자료이며 투자·법률·세무 자문이 아닙니다.
              수집된 연락처는 출시 안내 및 서비스 알림 목적으로만 사용됩니다.
            </p>
          </form>
        )}
      </section>

      {/* ── 7. 비교표 ── */}
      <section className={styles.compareSection}>
        <p className={styles.compareEyebrow}>리포트 비교</p>
        <h3 className={styles.compareHeading}>기본 vs 프리미엄</h3>
        <div className={styles.compareTableWrap}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th></th>
              <th className={styles.colOther}>
                <span className={styles.colName}>기본</span>
                {!isBetaMode() && <span className={styles.colPrice}>29,000원</span>}
                <span className={styles.colGrade}>R1 · R2</span>
              </th>
              <th className={styles.colActive}>
                <span className={styles.colName}>프리미엄</span>
                {!isBetaMode() && <span className={styles.colPrice}>99,000원</span>}
                <span className={styles.colGrade}>R3 · R4</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.groupRow}><td colSpan={3}>공통</td></tr>
            {[
              '분담금 시나리오 분석',
              '자산 잠식 구간 예측',
              '총회 핵심 질문 5개',
              '조합 대응 체크리스트',
            ].map((label) => (
              <tr key={label}>
                <td><span className={styles.featureName}>{label}</span></td>
                <td className={styles.checkYes}>✓</td>
                <td className={`${styles.colActive} ${styles.checkYes}`}>✓</td>
              </tr>
            ))}
            <tr className={styles.groupRow}><td colSpan={3}>프리미엄 전용</td></tr>
            {[
              '협상 절감액 시뮬레이션',
              '총회 발언 스크립트',
              '30일 행동 타임라인',
              '20페이지 이상 심층 분석',
            ].map((label) => (
              <tr key={label}>
                <td><span className={styles.featureName}>{label}</span></td>
                <td className={styles.checkNo}>✗</td>
                <td className={`${styles.colActive} ${styles.checkYes}`}>✓</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className={styles.downsellNote}>
          <Link href="/member/report-basic" className={styles.downsellLink}>
            R1·R2 등급이라면 베이직 리포트로도 충분합니다 →
          </Link>
        </div>
      </section>

      {/* ── 8. 공유 (CTA 이후) ── */}
      <section className={styles.shareSection}>
        <p className={styles.shareDesc}>같은 단지 조합원에게 공유해보세요.</p>
        <button className={styles.shareBtn} onClick={handleShare}>
          {shareCopied ? '링크가 복사되었습니다 ✓' : '분석 결과 공유하기'}
        </button>
      </section>

      <div className={styles.footerLinks}>
        <Link href="/member" className={styles.backLink}>← 분담금 다시 계산하기</Link>
      </div>

    </div>
  );
}
