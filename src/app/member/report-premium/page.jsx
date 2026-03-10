'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isBetaMode } from '@/lib/feature-flags';
import AssetShockCard from '@/components/report/AssetShockCard';
import styles from './page.module.css';

// R3 기본 협상 절감률 (shock_engine 기준)
const NEGOTIATION_REDUCTION = 0.22;
const COST_INCREASE_RATE    = 0.10;

function calcSavings(expectedExtra) {
  const expected_contribution    = expectedExtra * (1 + COST_INCREASE_RATE);
  const comparison_contribution  = expected_contribution * (1 - NEGOTIATION_REDUCTION);
  return Math.round((expected_contribution - comparison_contribution) * 10000); // 만원
}

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
  const [savings, setSavings]               = useState(null); // 만원 단위
  const [shareCopied, setShareCopied]       = useState(false);
  const [context, setContext]               = useState(null);
  const [leadCount, setLeadCount]           = useState(null);
  const [trafficSource, setTrafficSource]   = useState({});

  // ── 공유 링크 생성 ───────────────────────────────────────────
  // 프리미엄 페이지는 개인화 데이터 없음 — 리포트 유형 정보만 공유
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

    // URL params take priority over localStorage (Fix 1)
    const assetParam = params.get('asset');
    const extraParam = params.get('extra');
    const gradeParam = params.get('grade');

    try {
      if (assetParam && extraParam && gradeParam) {
        const ctx = { assetValue: assetParam, expectedExtra: extraParam, riskGrade: gradeParam };
        setContext(ctx);
        if (Number(extraParam) > 0) setSavings(calcSavings(Number(extraParam)));
        try { localStorage.setItem('basicReportContext', JSON.stringify(ctx)); } catch {}
      } else {
        // Fallback: memberPrefill for savings
        try {
          const raw = localStorage.getItem('memberPrefill');
          if (raw) {
            const { expectedExtra } = JSON.parse(raw);
            if (expectedExtra && Number(expectedExtra) > 0) {
              setSavings(calcSavings(Number(expectedExtra)));
            }
          }
        } catch {}

        // Fallback: basicReportContext for context
        try {
          const raw = localStorage.getItem('basicReportContext');
          if (raw) {
            setContext(JSON.parse(raw));
          } else {
            alert('먼저 무료 계산을 진행해주세요.');
            router.push('/member');
          }
        } catch {}
      }
    } catch {}

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

  async function handlePurchase(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (phone.trim() && !PHONE_RE.test(cleanPhone)) {
      setPhoneError('올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)');
      return;
    }
    setLoading(true);

    const trafficStr = JSON.stringify(trafficSource);
    const leadBody = {
      email:          email.trim(),
      phone:          cleanPhone || null,
      asset_value:    context ? Number(context.assetValue)    : null,
      expected_extra: context ? Number(context.expectedExtra) : null,
      risk_grade:     context?.riskGrade ?? null,
      traffic_source: trafficStr,
    };

    if (isBetaMode()) {
      try {
        await fetch('/api/lead-submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...leadBody, product_type: 'premium_beta', beta: true }),
        });
        setSubmitted(true);
      } catch {
        alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 정식 출시 이후 — Toss Payments 결제
    try {
      const res = await fetch('/api/payments/prepare', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:          email.trim(),
          phone:          cleanPhone || null,
          product_type:   'premium',
          asset_value:    context ? Number(context.assetValue)    : null,
          expected_extra: context ? Number(context.expectedExtra) : null,
          risk_grade:     context?.riskGrade ?? null,
          traffic_source: trafficStr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '결제 준비에 실패했습니다.');

      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
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
      alert(err.message ?? '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>

      {/* ── Section 1: 소개 ───────────────────────────────────────────── */}
      <section className={styles.intro}>
        <p className={styles.eyebrow}>M-DEENO Prop-Logic™</p>
        <h1 className={styles.title}>프리미엄 전략 리포트</h1>
        <p className={styles.subtitle}>
          30페이지 심층 분석 · 협상 전략 · 총회 발언 스크립트 · 행동 타임라인
        </p>

        <ul className={styles.featureList}>
          <li>공사비 시나리오별 자산 잠식 구간 정밀 분석</li>
          <li>위험등급 기반 협상 절감 시뮬레이션</li>
          <li>총회 발언 스크립트 및 대응 질문 리스트</li>
          <li>조합원 행동 타임라인 (30일 플랜)</li>
          <li>전문가 수준의 McKinsey 스타일 보고서 형식</li>
        </ul>
      </section>

      {/* ── Section 1.5: 콘텐츠 소개 + 절감 하이라이트 ─────────────────── */}
      <section className={styles.contentSection}>
        <p className={styles.contentSectionLabel}>Premium 리포트에서 확인할 수 있는 내용</p>
        <ul className={styles.contentList}>
          <li>총회 발언 스크립트</li>
          <li>공사비 협상 전략</li>
          <li>사업 구조 분석</li>
          <li>조합 대응 전략</li>
          <li>행동 로드맵</li>
        </ul>

        <div className={styles.savingsBlock}>
          {savings !== null ? (
            <>
              <p className={styles.savingsLabel}>협상 전략 적용 시 예상 절감액</p>
              <div className={styles.savingsNumber}>
                -{savings.toLocaleString()}만원
              </div>
              <p className={styles.savingsNote}>
                공사비 10% 상승 시나리오 기준 · 협상 성공 시 22% 절감 적용
              </p>
            </>
          ) : (
            <>
              <p className={styles.savingsLabel}>협상 전략 적용 시 예상 절감율</p>
              <div className={styles.savingsNumber}>최대 22%</div>
              <p className={styles.savingsNote}>
                내 분담금을 입력하면 실제 절감액을 계산해 드립니다
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Section 2: 공개 미리보기 (2페이지) ──────────────────────────── */}
      <section className={styles.previewSection}>
        <p className={styles.previewLabel}>리포트 미리보기</p>

        {/* P1 — 표지 (다크) */}
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
          <span className={`${styles.riskBadge} ${styles.badgeR3}`}>
            R3 — 고위험
          </span>
        </div>

        {/* P2 — 핵심 위험 지표 */}
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
      </section>

      {/* ── Section 3: 잠긴 미리보기 ─────────────────────────────────────── */}
      <section className={styles.lockedSection}>
        <div className={`${styles.reportPage} ${styles.reportPageBlur}`}>
          <div className={styles.blurContent}>
            <p className={styles.pageEyebrow}>SECTION 02</p>
            <h3 className={styles.pageSectionTitle}>시나리오별 분담금 구조 분석</h3>
            <div className={styles.blurLine} />
            <div className={styles.blurLine} />
            <div className={styles.blurLineShort} />
          </div>
          <div className={styles.blurOverlay}>
            <p className={styles.blurOverlayText}>
              전체 전략 리포트는 구매 후 확인 가능합니다.
            </p>
          </div>
        </div>

        <div className={`${styles.reportPage} ${styles.reportPageBlur}`}>
          <div className={styles.blurContent}>
            <p className={styles.pageEyebrow}>SECTION 03</p>
            <h3 className={styles.pageSectionTitle}>총회 발언 스크립트 및 행동 타임라인</h3>
            <div className={styles.blurLine} />
            <div className={styles.blurLine} />
            <div className={styles.blurLineShort} />
          </div>
          <div className={styles.blurOverlay}>
            <p className={styles.blurOverlayText}>
              전체 전략 리포트는 구매 후 확인 가능합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── Basic vs Premium 비교표 ── */}
      <section className={styles.compareSection}>
        <p className={styles.compareTitle}>기본 vs 프리미엄 리포트 비교</p>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th>기능</th>
              <th>기본 리포트<br /><span>29,000원</span></th>
              <th className={styles.colActive}>프리미엄 리포트<br /><span>99,000원</span></th>
            </tr>
          </thead>
          <tbody>
            {[
              ['분담금 시나리오 분석', true, true],
              ['자산 잠식 시점 계산', true, true],
              ['총회 핵심 질문 5개', true, true],
              ['조합 대응 체크리스트', true, true],
              ['협상 절감 전략 시뮬레이션', false, true],
              ['총회 발언 스크립트', false, true],
              ['조합원 행동 타임라인 (30일)', false, true],
              ['30페이지 심층 분석', false, true],
            ].map(([label, basic, premium]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{basic ? '✓' : '—'}</td>
                <td className={styles.colActive}>{premium ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── 공유 ────────────────────────────────────────────────────────── */}
      <section className={styles.shareSection}>
        <p className={styles.shareDesc}>
          이 분석 결과를 다른 조합원과 공유해보세요.
        </p>
        <button className={styles.shareBtn} onClick={handleShare}>
          {shareCopied ? '링크가 복사되었습니다 ✓' : '분석 결과 공유하기'}
        </button>
      </section>

      {/* ── Asset Shock Card ─────────────────────────────────────────────── */}
      {context && (
        <AssetShockCard
          assetValue={Number(context.assetValue)}
          expectedExtra={Number(context.expectedExtra)}
          riskGrade={context.riskGrade}
        />
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        {submitted ? (
          <div className={styles.successBox}>
            신청이 접수되었습니다. 출시 특가가 적용됩니다 — 6월 정식 출시 시 리포트를 발송해드립니다.
          </div>
        ) : (
          <form className={styles.ctaForm} onSubmit={handlePurchase} noValidate>
            {isBetaMode() && (
              <div className={styles.betaBadge}>
                🚧 사전 신청 진행 중 · 6월 정식 출시 예정
              </div>
            )}
            {leadCount !== null && leadCount > 0 && (
              <p className={styles.socialProof}>
                현재 {leadCount.toLocaleString()}명의 조합원이 분석을 완료했습니다.
              </p>
            )}
            <h2 className={styles.ctaTitle}>
              {isBetaMode() ? '프리미엄 사전 신청' : 'Premium 전략 리포트 구매'}
            </h2>
            <p className={styles.ctaDesc}>
              {isBetaMode()
                ? '정가 149,000원 → 출시 특가 99,000원 · 6월 정식 출시 이후 결제 가능'
                : '출시 특가 99,000원 (정가 149,000원) · 결제 완료 즉시 PDF가 자동 다운로드됩니다.'}
            </p>

            <div className={styles.ctaInputRow}>
              <input
                className={`${styles.ctaInput}${emailError ? ` ${styles.ctaInputError}` : ''}`}
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                autoComplete="email"
              />
              {emailError && (
                <p className={styles.ctaError}>{emailError}</p>
              )}
              <input
                className={`${styles.ctaInput}${phoneError ? ` ${styles.ctaInputError}` : ''}`}
                type="tel"
                placeholder="휴대폰 번호 (선택 · 예: 01012345678)"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                autoComplete="tel"
              />
              {phoneError && (
                <p className={styles.ctaError}>{phoneError}</p>
              )}
              <button
                className={styles.ctaBtn}
                type="submit"
                disabled={loading || !isPrivacyAgreed || !isRefundAgreed || !email.trim()}
              >
                {loading ? '처리 중...' : isBetaMode() ? '프리미엄 사전 신청하기' : 'Premium 전략 리포트 구매 →'}
              </button>
            </div>

            <div className={styles.consentBox}>
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={isPrivacyAgreed}
                  onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                />
                <span>[필수] 개인정보 수집 및 이용에 동의합니다. (이메일: 리포트 발송 목적)</span>
              </label>
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={isRefundAgreed}
                  onChange={(e) => setIsRefundAgreed(e.target.checked)}
                />
                <span>[필수] 디지털 상품(PDF) 특성상 생성/다운로드 이후 환불이 불가함에 동의합니다.</span>
              </label>
            </div>

            <p className={styles.ctaNote}>
              {isBetaMode() ? '정가 149,000원 · 출시 특가 99,000원' : '출시 특가 99,000원 (정가 149,000원)'}
            </p>
          </form>
        )}
      </section>

    </div>
  );
}
