'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { downloadPdf } from '@/lib/download-pdf';
import { isBetaMode } from '@/lib/feature-flags';
import AssetShockCard from '@/components/report/AssetShockCard';
import styles from './page.module.css';

const RISK_COLOR = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };
const RISK_LABEL = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };

const REPORT_CONTENTS = [
  '공사비 5%, 10%, 20% 상승 시나리오별 민감도 분석표',
  '내 자산 잠식 시점 계산 (공사비 상승률 기준)',
  '총회 핵심 질문 리스트 5개',
  '조합 대응 체크리스트',
  '분담금 구조 해설 및 핵심 용어 정리',
];

export default function ReportBasicPage() {
  const router = useRouter();
  const [context, setContext] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [email, setEmail]       = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone]       = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isRefundAgreed, setIsRefundAgreed]   = useState(false);
  const [leadCount, setLeadCount]             = useState(null);
  const [trafficSource, setTrafficSource]     = useState({});

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
        try { localStorage.setItem('basicReportContext', JSON.stringify(ctx)); } catch {}
      } else {
        const raw = localStorage.getItem('basicReportContext');
        if (raw) {
          setContext(JSON.parse(raw));
        } else {
          alert('먼저 무료 계산을 진행해주세요.');
          router.push('/member');
        }
      }
    } catch {}

    // 소셜 프루프 카운트
    fetch('/api/lead-count')
      .then((r) => r.json())
      .then((d) => setLeadCount(d.count))
      .catch(() => {});

    // 트래픽 소스 캡처
    setTrafficSource({
      utm_source:   params.get('utm_source')   ?? null,
      utm_campaign: params.get('utm_campaign') ?? null,
      referrer:     document.referrer || null,
    });
  }, []);

  const PHONE_RE = /^010\d{7,8}$/;

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
      risk_grade:     context?.riskGrade    ?? null,
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
        alert('베타 테스터 신청이 완료되었습니다.\n\n6월 15일 정식 출시 시 베타 가격으로 결제 링크를 보내드립니다.');
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
          product_type:   'basic',
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
  };

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.hero}>
        <p className={styles.eyebrow}>M-DEENO 기본 리포트</p>
        <h1>재건축 분담금<br />구조 검증 리포트</h1>
        <p className={styles.subtitle}>
          공사비 상승 시나리오별 내 자산 잠식 시점과<br />
          총회 대응 전략을 담은 기본 분석 리포트입니다.
        </p>
      </div>

      {/* ── Context Card (calc result from /member) ── */}
      {context && (
        <div className={styles.contextCard}>
          <p className={styles.contextLabel}>분석 결과 요약</p>
          <div className={styles.contextRow}>
            <div className={styles.contextItem}>
              <span>위험 등급</span>
              <strong style={{ color: RISK_COLOR[context.riskGrade] }}>
                {context.riskGrade} — {RISK_LABEL[context.riskGrade]}
              </strong>
            </div>
            <div className={styles.contextItem}>
              <span>종전자산</span>
              <strong>{context.assetValue}억원</strong>
            </div>
            <div className={styles.contextItem}>
              <span>예상 추가 분담금</span>
              <strong>{context.expectedExtra}억원</strong>
            </div>
          </div>
          <p className={styles.contextNote}>
            위 분석을 기반으로 아래 리포트에서 상세 전략을 제공합니다.
          </p>
        </div>
      )}

      {/* ── Report Contents ── */}
      <div className={styles.contentsCard}>
        <p className={styles.sectionLabel}>리포트 포함 내용</p>
        <ul className={styles.contentsList}>
          {REPORT_CONTENTS.map((item, i) => (
            <li key={i} className={styles.contentsItem}>
              <span className={styles.checkIcon}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Asset Shock Card ── */}
      {context && (
        <AssetShockCard
          assetValue={Number(context.assetValue)}
          expectedExtra={Number(context.expectedExtra)}
          riskGrade={context.riskGrade}
        />
      )}

      {/* ── Pricing + CTA ── */}
      <div className={styles.ctaBox}>
        {isBetaMode() && (
          <div className={styles.betaBadge}>
            🚧 사전 신청 진행 중 · 6월 정식 출시 예정
          </div>
        )}
        <div className={styles.priceBox}>
          <span className={styles.badge}>{isBetaMode() ? '베타' : '출시 특가'} 29,000원</span>
          <span className={styles.price}>정가 39,000원</span>
        </div>
        <input
          className={`${styles.emailInput}${emailError ? ` ${styles.emailInputError}` : ''}`}
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          autoComplete="email"
        />
        {emailError && <p className={styles.emailError}>{emailError}</p>}

        <input
          className={`${styles.emailInput}${phoneError ? ` ${styles.emailInputError}` : ''}`}
          type="tel"
          placeholder="휴대폰 번호 (선택 · 예: 01012345678)"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
          autoComplete="tel"
        />
        {phoneError && <p className={styles.emailError}>{phoneError}</p>}

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

        {leadCount !== null && leadCount > 0 && (
          <p className={styles.socialProof}>
            현재 {leadCount.toLocaleString()}명의 조합원이 분석을 완료했습니다.
          </p>
        )}

        <button
          onClick={handlePurchase}
          className={styles.purchaseBtn}
          disabled={loading || !isPrivacyAgreed || !isRefundAgreed || !email.trim()}
        >
          {loading ? '처리 중...' : isBetaMode() ? '베타 테스터 신청하기' : '기본 리포트 구매 →'}
        </button>
        <p className={styles.priceNote}>
          {isBetaMode()
            ? '정가 39,000원 → 베타가 29,000원 · 6월 정식 출시 이후 결제 가능'
            : '출시 특가 29,000원 (정가 39,000원) · 결제 완료 즉시 PDF가 자동 다운로드됩니다.'}
        </p>
        <div className={styles.disclaimer}>
          <p>※ 본 리포트는 공개 자료와 사용자가 입력한 정보를 기반으로 생성된 참고용 분석 자료입니다. 투자, 법률, 세무 자문이 아니며 실제 사업 결과는 달라질 수 있습니다.</p>
          <p>※ 본 서비스는 디지털 콘텐츠로 제공되며 리포트 발송 이후 환불이 제한될 수 있습니다.</p>
          <p>※ 입력하신 이메일은 리포트 발송 및 서비스 안내 목적으로만 사용됩니다.</p>
        </div>
      </div>

      {/* ── Basic vs Premium 비교표 ── */}
      <div className={styles.compareBox}>
        <p className={styles.compareEyebrow}>리포트 선택 가이드</p>
        <h3 className={styles.compareHeading}>어떤 리포트가 나에게 맞을까?</h3>
        <p className={styles.compareSubtitle}>위험 등급이 높을수록 더 강한 전략 도구가 필요합니다</p>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th></th>
              <th className={styles.colActive}>
                <span className={styles.colName}>기본 리포트</span>
                <span className={styles.colPrice}>29,000원</span>
                <span className={styles.colGrade}>R1 · R2 추천</span>
              </th>
              <th className={styles.colOther}>
                <span className={styles.colName}>프리미엄 전략</span>
                <span className={styles.colPrice}>99,000원</span>
                <span className={styles.colGrade}>R3 · R4 추천</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.groupRow}><td colSpan={3}>공통 포함</td></tr>
            {[
              ['분담금 시나리오 분석', '공사비 5·10·20% 상승 시 내 분담금 변화'],
              ['자산 잠식 구간 예측', '내 자산이 줄어드는 공사비 상승률 계산'],
              ['총회 핵심 질문 5개', '총회에서 바로 쓸 수 있는 검증 질문'],
              ['조합 대응 체크리스트', '단계별 확인 사항 정리'],
            ].map(([label, desc]) => (
              <tr key={label}>
                <td>
                  <span className={styles.featureName}>{label}</span>
                  <span className={styles.featureDesc}>{desc}</span>
                </td>
                <td className={`${styles.colActive} ${styles.checkYes}`}>✓</td>
                <td className={styles.checkYes}>✓</td>
              </tr>
            ))}
            <tr className={styles.groupRow}><td colSpan={3}>프리미엄 전용 전략</td></tr>
            {[
              ['협상 절감액 시뮬레이션', '전략 적용 시 절감 가능 금액 추정'],
              ['총회 발언 스크립트', '즉시 사용 가능한 협상 발언 전문'],
              ['30일 행동 타임라인', '총회 전 단계별 대응 일정표'],
              ['30페이지 심층 분석', '컨설팅 수준의 사업 구조 분석'],
            ].map(([label, desc]) => (
              <tr key={label}>
                <td>
                  <span className={styles.featureName}>{label}</span>
                  <span className={styles.featureDesc}>{desc}</span>
                </td>
                <td className={styles.checkNo}>✗</td>
                <td className={styles.checkYes}>✓</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.upsellCallout}>
          <p>R3·R4 등급이라면 발언 스크립트 하나로 수천만원 절감이 가능합니다</p>
          <Link href="/member/report-premium" className={styles.upsellLink}>
            프리미엄 전략 보기 →
          </Link>
        </div>
      </div>

      {/* ── Back ── */}
      <div className={styles.footerLinks}>
        <Link href="/member" className={styles.backLink}>
          ← 분담금 다시 계산하기
        </Link>
      </div>

    </div>
  );
}
