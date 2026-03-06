'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
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
  const [context, setContext] = useState(null);
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('basicReportContext');
      if (raw) setContext(JSON.parse(raw));
    } catch {}
  }, []);

  const handlePurchase = async () => {
    const email = prompt('리포트를 받을 이메일을 입력해주세요.');
    if (!email) return;

    setLoading(true);
    try {
      await fetch('/api/lead-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          product_type:   'basic',
          asset_value:    context ? Number(context.assetValue) : null,
          expected_extra: context ? Number(context.expectedExtra) : null,
          risk_grade:     context?.riskGrade ?? null,
        }),
      });
      sendGAEvent({ event: 'basic_lead_submit' });
      alert('베타 신청이 접수되었습니다. 베타 가격 적용 중 — 리포트를 곧 발송해드립니다.');
    } catch (err) {
      console.error('리포트 요청 실패:', err);
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
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

      {/* ── Pricing + CTA ── */}
      <div className={styles.ctaBox}>
        <div className={styles.priceBox}>
          <span className={styles.badge}>베타 29,000원</span>
          <span className={styles.price}>정가 39,000원</span>
        </div>
        <button
          onClick={handlePurchase}
          className={styles.purchaseBtn}
          disabled={loading}
        >
          {loading ? '처리 중...' : '기본 리포트 신청하기 →'}
        </button>
        <p className={styles.priceNote}>
          베타 가격 적용 중 · 이메일 확인 후 개별 발송됩니다.
        </p>
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
