'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { isBetaMode } from '@/lib/feature-flags';
import AssetShockCard from '@/components/report/AssetShockCard';
import styles from './page.module.css';

const RISK_COLOR = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };
const RISK_LABEL = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };

const REPORT_CONTENTS = [
  { icon: '📊', title: '공사비 시나리오 분석', desc: '5% · 10% · 20% 상승 시 내 분담금 변화' },
  { icon: '⚠️', title: '자산 잠식 시점 계산', desc: '내 자산이 줄어드는 공사비 상승률 임계점' },
  { icon: '💬', title: '총회 핵심 질문 5개', desc: '총회장에서 바로 쓸 수 있는 검증 질문' },
  { icon: '✅', title: '조합 대응 체크리스트', desc: '단계별 확인 사항 정리' },
  { icon: '📖', title: '분담금 구조 해설', desc: '핵심 용어 정리 및 계산 구조 설명' },
];

export default function ReportBasicPage() {
  const router = useRouter();
  const [context, setContext]               = useState(null);
  const [loading, setLoading]               = useState(false);
  const [email, setEmail]                   = useState('');
  const [emailError, setEmailError]         = useState('');
  const [phone, setPhone]                   = useState('');
  const [phoneError, setPhoneError]         = useState('');
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isRefundAgreed, setIsRefundAgreed]   = useState(false);
  const [submitted, setSubmitted]             = useState(false);
  const [submitError, setSubmitError]         = useState('');
  const [leadCount, setLeadCount]             = useState(null);
  const [trafficSource, setTrafficSource]     = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset');
    const extraParam = params.get('extra');
    const gradeParam = params.get('grade');

    try {
      if (assetParam && extraParam && gradeParam) {
        const ctx = { assetValue: assetParam, expectedExtra: extraParam, riskGrade: gradeParam };
        setContext(ctx);
        try { localStorage.setItem('basicReportContext', JSON.stringify(ctx)); } catch {}
      } else {
        const raw = localStorage.getItem('basicReportContext');
        if (raw) {
          setContext(JSON.parse(raw));
        } else {
          router.push('/member');
        }
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
  const isHighRisk = context?.riskGrade === 'R3' || context?.riskGrade === 'R4';

  const handlePurchase = async () => {
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

    sendGAEvent({ event: 'basic_lead_submit' });

    if (isBetaMode()) {
      try {
        await fetch('/api/lead-submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...leadBody, product_type: 'basic_beta', beta: true }),
        });
        setSubmitted(true);
      } catch {
        setSubmitError('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
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
          email:          email.trim(),
          phone:          cleanPhone || null,
          product_type:   'basic',
          asset_value:    context ? Number(context.assetValue)    : null,
          expected_extra: context ? Number(context.expectedExtra) : null,
          risk_grade:     context?.riskGrade ?? null,
          traffic_source: trafficStr,
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
      alert(err.message ?? '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      {/* ── 1. Header ── */}
      <div className={styles.hero}>
        <p className={styles.eyebrow}>M-DEENO 기본 리포트</p>
        <h1>내 분담금 리스크,<br />데이터로 검증하세요</h1>
        <p className={styles.subtitle}>
          공사비 상승 시나리오별 자산 잠식 시점과<br />
          총회 대응 전략을 담은 분석 리포트
        </p>
      </div>

      {/* ── 2. 분석 결과 카드 ── */}
      {context && (
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
      )}

      {/* ── 3. R3/R4: 프리미엄 강력 유도 ── */}
      {isHighRisk && (
        <div className={styles.premiumNudge}>
          <p className={styles.premiumNudgeTitle}>
            {context.riskGrade} 등급 — 기본 리포트로는 부족합니다
          </p>
          <p className={styles.premiumNudgeDesc}>
            자산의 {context.riskGrade === 'R4' ? '40% 초과' : '30~40%'}에 달하는 리스크는
            협상 전략과 총회 발언 스크립트 없이 대응하기 어렵습니다.
          </p>
          <Link href="/member/report-premium" className={styles.premiumNudgeBtn}>
            프리미엄 전략 리포트 보기 →
          </Link>
          <p className={styles.premiumNudgeSkip}>기본 리포트만 신청하려면 아래로 스크롤하세요</p>
        </div>
      )}

      {/* ── 4. 시뮬레이션 ── */}
      {context && (
        <AssetShockCard
          assetValue={Number(context.assetValue)}
          expectedExtra={Number(context.expectedExtra)}
          riskGrade={context.riskGrade}
        />
      )}

      {/* ── 5. 리포트 포함 내용 ── */}
      <div className={styles.contentsCard}>
        <p className={styles.contentsHeading}>기본 리포트에 포함된 내용</p>
        <ul className={styles.contentsList}>
          {REPORT_CONTENTS.map((item) => (
            <li key={item.title} className={styles.contentsItem}>
              <span className={styles.contentsIcon}>{item.icon}</span>
              <div>
                <span className={styles.contentsTitle}>{item.title}</span>
                <span className={styles.contentsDesc}>{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 6. CTA ── */}
      <div className={styles.ctaBox}>
        {submitted ? (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>사전 신청이 완료되었습니다 ✓</p>
            <p className={styles.successDesc}>
              6월 정식 출시 시 출시 특가 결제 링크를 이메일로 보내드립니다.
            </p>
          </div>
        ) : (
        <>
        {isBetaMode() && (
          <div className={styles.betaBadge}>
            🚧 사전 신청 진행 중 · 6월 정식 출시 예정
          </div>
        )}

        <p className={styles.ctaHeading}>
          {isBetaMode() ? '6월 출시 시 기본 리포트를 받아보세요' : '지금 바로 리포트를 받아보세요'}
        </p>

        {!isBetaMode() && (
          <div className={styles.priceRow}>
            <span className={styles.priceFinal}>29,000원</span>
            <span className={styles.priceOriginal}>정가 39,000원</span>
            <span className={styles.priceBadge}>출시 특가</span>
          </div>
        )}

        <input
          className={`${styles.input}${emailError ? ` ${styles.inputError}` : ''}`}
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          autoComplete="email"
        />
        {emailError && <p className={styles.fieldError}>{emailError}</p>}

        <input
          className={`${styles.input}${phoneError ? ` ${styles.inputError}` : ''}`}
          type="tel"
          placeholder="휴대폰 번호 (선택 · 예: 01012345678)"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
          autoComplete="tel"
        />
        {phoneError && <p className={styles.fieldError}>{phoneError}</p>}

        <div className={styles.consentBox}>
          <label className={styles.consentLabel}>
            <input type="checkbox" checked={isPrivacyAgreed} onChange={(e) => setIsPrivacyAgreed(e.target.checked)} />
            <span>[필수] 개인정보 수집 및 이용 동의 (이메일: 리포트 발송)</span>
          </label>
          {!isBetaMode() && (
            <label className={styles.consentLabel}>
              <input type="checkbox" checked={isRefundAgreed} onChange={(e) => setIsRefundAgreed(e.target.checked)} />
              <span>[필수] 디지털 상품 특성상 다운로드 이후 환불 불가에 동의</span>
            </label>
          )}
        </div>

        {leadCount !== null && leadCount > 0 && (
          <p className={styles.socialProof}>
            현재 {leadCount.toLocaleString()}명이 분석을 완료했습니다
          </p>
        )}

        <button
          onClick={handlePurchase}
          className={styles.purchaseBtn}
          disabled={loading || !isPrivacyAgreed || (!isBetaMode() && !isRefundAgreed) || !email.trim()}
        >
          {loading ? '처리 중...' : isBetaMode() ? '사전 신청하기' : '기본 리포트 구매하기 →'}
        </button>

        <p className={styles.ctaNote}>
          {isBetaMode()
            ? '정식 출시(6/15) 이후 결제 링크를 이메일로 발송합니다'
            : '결제 완료 즉시 입력하신 이메일로 PDF가 발송됩니다'}
        </p>

        <p className={styles.disclaimer}>
          본 리포트는 참고용 분석 자료이며 투자·법률·세무 자문이 아닙니다.
          이메일은 리포트 발송 목적으로만 사용됩니다.
        </p>
        {submitError && <p className={styles.fieldError}>{submitError}</p>}
        </>
        )}
      </div>

      {/* ── 7. 비교표 (참고용) ── */}
      <div className={styles.compareBox}>
        <p className={styles.compareEyebrow}>리포트 비교</p>
        <h3 className={styles.compareHeading}>기본 vs 프리미엄</h3>
        <div className={styles.compareTableWrap}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th></th>
              <th className={styles.colActive}>
                <span className={styles.colName}>기본</span>
                {!isBetaMode() && <span className={styles.colPrice}>29,000원</span>}
                <span className={styles.colGrade}>R1 · R2</span>
              </th>
              <th className={styles.colOther}>
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
                <td className={`${styles.colActive} ${styles.checkYes}`}>✓</td>
                <td className={styles.checkYes}>✓</td>
              </tr>
            ))}
            <tr className={styles.groupRow}><td colSpan={3}>프리미엄 전용</td></tr>
            {[
              '협상 절감액 시뮬레이션',
              '총회 발언 스크립트',
              '30일 행동 타임라인',
              '30페이지 심층 분석',
            ].map((label) => (
              <tr key={label}>
                <td><span className={styles.featureName}>{label}</span></td>
                <td className={styles.checkNo}>✗</td>
                <td className={styles.checkYes}>✓</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className={styles.upsellCallout}>
          <Link href="/member/report-premium" className={styles.upsellLink}>
            프리미엄 전략 리포트 보기 →
          </Link>
        </div>
      </div>

      <div className={styles.footerLinks}>
        <Link href="/member" className={styles.backLink}>← 분담금 다시 계산하기</Link>
      </div>

    </div>
  );
}
