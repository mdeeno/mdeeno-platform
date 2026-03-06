'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { downloadPdf } from '@/lib/download-pdf';
import { isBetaMode } from '@/lib/feature-flags';
import styles from './page.module.css';

// ── 구매 핸들러 (베타: 이메일 수집) ──────────────────────────────────────────
async function submitPremiumLead(email) {
  await fetch('/api/lead-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, product_type: 'premium' }),
  });
}

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
  const [submitted, setSubmitted]           = useState(false);
  const [loading, setLoading]               = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isRefundAgreed, setIsRefundAgreed]   = useState(false);
  const [savings, setSavings]         = useState(null); // 만원 단위
  const [shareCopied, setShareCopied] = useState(false);
  const [context, setContext]         = useState(null); // basicReportContext (asset_value + expected_extra)

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
    try {
      const raw = localStorage.getItem('memberPrefill');
      if (raw) {
        const { expectedExtra } = JSON.parse(raw);
        if (expectedExtra && Number(expectedExtra) > 0) {
          setSavings(calcSavings(Number(expectedExtra)));
        }
      }
    } catch {
      // localStorage 없음 또는 파싱 실패 — 무시
    }

    try {
      const raw = localStorage.getItem('basicReportContext');
      if (raw) {
        setContext(JSON.parse(raw));
      } else {
        alert('먼저 무료 계산을 진행해주세요.');
        router.push('/member');
      }
    } catch {}
  }, []);

  async function handlePurchase(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    setLoading(true);

    const payload = {
      email:          email.trim(),
      asset_value:    context ? Number(context.assetValue)    : 0,
      expected_extra: context ? Number(context.expectedExtra) : 0,
    };

    if (isBetaMode()) {
      try {
        await fetch('/api/lead-submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email:          email.trim(),
            product_type:   'premium_beta',
            asset_value:    context?.assetValue    ?? null,
            expected_extra: context?.expectedExtra ?? null,
            beta:           true,
          }),
        });
        alert('베타 테스터 신청이 완료되었습니다.\n\n6월 15일 정식 출시 시 베타 가격으로 결제 링크를 보내드립니다.');
      } catch {
        alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 정식 출시 이후 — 즉시 PDF 다운로드
    submitPremiumLead(email.trim()).catch(() => {});

    try {
      await downloadPdf('/api/member-premium-report', payload, 'M-DEENO_프리미엄전략리포트.pdf');
      setSubmitted(true);
      alert('리포트 다운로드가 완료되었습니다.');
    } catch (err) {
      alert(err.message || '리포트 생성에 실패했습니다.');
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

      {/* ── 공유 ────────────────────────────────────────────────────────── */}
      <section className={styles.shareSection}>
        <p className={styles.shareDesc}>
          이 분석 결과를 다른 조합원과 공유해보세요.
        </p>
        <button className={styles.shareBtn} onClick={handleShare}>
          {shareCopied ? '링크가 복사되었습니다 ✓' : '분석 결과 공유하기'}
        </button>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        {submitted ? (
          <div className={styles.successBox}>
            베타 신청이 접수되었습니다. 베타 가격 적용 중 — 리포트를 곧 발송해드립니다.
          </div>
        ) : (
          <form className={styles.ctaForm} onSubmit={handlePurchase} noValidate>
            {isBetaMode() && (
              <div className={styles.betaBadge}>
                🚧 BETA 테스트 진행 중 · 6월 15일 정식 출시 예정
              </div>
            )}
            <h2 className={styles.ctaTitle}>
              {isBetaMode() ? '프리미엄 베타 신청' : 'Premium 전략 리포트 다운로드'}
            </h2>
            <p className={styles.ctaDesc}>
              {isBetaMode()
                ? '정가 149,000원 → 베타가 99,000원 · 정식 출시(6/15) 이후 결제 가능'
                : '베타 가격 적용 중 — 결제 완료 즉시 PDF가 자동 다운로드됩니다.'}
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
              <button
                className={styles.ctaBtn}
                type="submit"
                disabled={loading || !isPrivacyAgreed || !isRefundAgreed}
              >
                {loading ? '처리 중...' : isBetaMode() ? '프리미엄 베타 신청하기' : 'Premium 전략 리포트 다운로드 →'}
              </button>
            </div>

            {emailError && (
              <p className={styles.ctaError}>{emailError}</p>
            )}

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
              정가 149,000원 · 베타 가격 적용 중 99,000원
            </p>
          </form>
        )}
      </section>

    </div>
  );
}
