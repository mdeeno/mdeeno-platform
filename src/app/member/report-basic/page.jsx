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
    try {
      const raw = localStorage.getItem('basicReportContext');
      if (raw) {
        setContext(JSON.parse(raw));
      } else {
        alert('먼저 무료 계산을 진행해주세요.');
        router.push('/member');
      }
    } catch {}

    // 소셜 프루프 카운트
    fetch('/api/lead-count')
      .then((r) => r.json())
      .then((d) => setLeadCount(d.count))
      .catch(() => {});

    // 트래픽 소스 캡처
    const params = new URLSearchParams(window.location.search);
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

    // 정식 출시 이후 — 결제 플로우 (구현 예정)
    fetch('/api/lead-submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...leadBody, product_type: 'basic' }),
    }).catch(() => {});

    setLoading(false);
    alert('정식 출시 준비 중입니다. 6월 15일부터 결제가 가능합니다.');
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
            🚧 BETA 테스트 진행 중 · 6월 15일 정식 출시 예정
          </div>
        )}
        <div className={styles.priceBox}>
          <span className={styles.badge}>베타 29,000원</span>
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
            현재 {leadCount.toLocaleString()}명의 조합원이 베타 분석을 신청했습니다.
          </p>
        )}

        <button
          onClick={handlePurchase}
          className={styles.purchaseBtn}
          disabled={loading || !isPrivacyAgreed || !isRefundAgreed || !email.trim()}
        >
          {loading ? '처리 중...' : isBetaMode() ? '베타 테스터 신청하기' : '기본 리포트 다운로드 →'}
        </button>
        <p className={styles.priceNote}>
          {isBetaMode()
            ? '정가 39,000원 → 베타가 29,000원 · 정식 출시(6/15) 이후 결제 가능'
            : '베타 가격 적용 중 · 결제 완료 즉시 PDF가 자동 다운로드됩니다.'}
        </p>
        <div className={styles.disclaimer}>
          <p>※ 본 리포트는 공개 자료와 사용자가 입력한 정보를 기반으로 생성된 참고용 분석 자료입니다. 투자, 법률, 세무 자문이 아니며 실제 사업 결과는 달라질 수 있습니다.</p>
          <p>※ 본 서비스는 디지털 콘텐츠로 제공되며 리포트 발송 이후 환불이 제한될 수 있습니다.</p>
          <p>※ 입력하신 이메일은 리포트 발송 및 서비스 안내 목적으로만 사용됩니다.</p>
        </div>
      </div>

      {/* ── Back / Upsell ── */}
      <div className={styles.footerLinks}>
        <Link href="/member" className={styles.backLink}>
          ← 분담금 다시 계산하기
        </Link>
        <Link href="/member/report-premium" className={styles.upsellLink}>
          전략 리포트(프리미엄) 보기 →
        </Link>
      </div>

    </div>
  );
}
