'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

function loadKakaoSdk(appKey) {
  return new Promise((resolve) => {
    if (window.Kakao) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakaojs/2.7.4/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(appKey);
      resolve();
    };
    document.head.appendChild(script);
  });
}

const RISK_LABELS = { R1: '안정', R2: '중위험', R3: '고위험', R4: '최고위험' };
const RISK_COLORS = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };

function formatAmount(eokValue) {
  if (eokValue == null) return '—';
  const manwon = Math.round(eokValue * 10000);
  if (manwon >= 10000) return `${Number(eokValue).toFixed(1)}억 원`;
  return `${manwon.toLocaleString()}만 원`;
}

export default function ReportSharePage() {
  const { report_id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (appKey) loadKakaoSdk(appKey);
  }, []);

  function handleCopyUrl() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleKakaoShare() {
    const url = window.location.href;
    if (window.Kakao?.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'M-DEENO 분담금 리스크 분석 결과',
          description: record
            ? `위험 등급 ${record.risk_level} · 예상 추가 분담금 ${formatAmount(record.expected_contribution)}`
            : 'M-DEENO 전략 리포트',
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [{
          title: '내 자산도 진단하기',
          link: {
            mobileWebUrl: `${window.location.origin}/member`,
            webUrl: `${window.location.origin}/member`,
          },
        }],
      });
    } else {
      handleCopyUrl();
    }
  }

  useEffect(() => {
    if (!report_id) return;
    (async () => {
      const { data, error } = await supabase
        .from('report_records')
        .select('risk_level, expected_contribution, comparison_contribution, shock_score, complex_name, location, created_at')
        .eq('report_id', report_id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setRecord(data);
      }
      setLoading(false);
    })();
  }, [report_id]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingBox}>리포트를 불러오는 중...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.notFound}>
          <p className={styles.notFoundTitle}>리포트를 찾을 수 없습니다</p>
          <p className={styles.notFoundDesc}>링크가 만료되었거나 존재하지 않는 리포트입니다.</p>
          <Link href="/member" className={styles.ctaBtn}>내 분담금 분석 시작하기</Link>
        </div>
      </div>
    );
  }

  const hasSavings = record.comparison_contribution != null && record.expected_contribution != null;
  const savings = hasSavings ? (record.expected_contribution - record.comparison_contribution) : null;
  const riskColor = RISK_COLORS[record.risk_level] ?? '#64748b';

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO</p>
        <h1 className={styles.title}>분담금 리스크 분석 결과</h1>
        {(record.complex_name || record.location) && (
          <p className={styles.subtitle}>
            {[record.complex_name, record.location].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className={styles.date}>발행일 {record.created_at}</p>
      </div>

      {/* Risk badge */}
      <div className={styles.riskRow}>
        <span className={styles.riskBadge} style={{ color: riskColor, borderColor: riskColor }}>
          {record.risk_level}
        </span>
        <span className={styles.riskLabel}>{RISK_LABELS[record.risk_level]} — 위험 등급</span>
      </div>

      {/* Key metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>예상 추가 분담금</span>
          <span className={styles.metricValue} style={{ color: riskColor }}>
            {formatAmount(record.expected_contribution)}
          </span>
        </div>
        {record.comparison_contribution != null && (
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>전략 적용 후</span>
            <span className={`${styles.metricValue} ${styles.metricSafe}`}>
              {formatAmount(record.comparison_contribution)}
            </span>
          </div>
        )}
        {savings != null && (
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>예상 절감액</span>
            <span className={`${styles.metricValue} ${styles.metricSafe}`}>
              -{formatAmount(savings)}
            </span>
          </div>
        )}
        {record.shock_score != null && (
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Shock Score</span>
            <span className={styles.metricValue} style={{ color: riskColor }}>
              {record.shock_score}<span className={styles.metricUnit}>/100</span>
            </span>
          </div>
        )}
      </div>

      {/* Share */}
      <div className={styles.shareBox}>
        <p className={styles.shareMessage}>
          이 리포트를 같은 단지 조합원에게 공유하세요.
        </p>
        <div className={styles.shareButtons}>
          <button className={styles.kakaoBtn} onClick={handleKakaoShare}>
            <span className={styles.kakaoBtnIcon}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <ellipse cx="9" cy="8.5" rx="8" ry="7" fill="#3A1D1D"/>
                <path d="M9 4C5.686 4 3 6.01 3 8.5c0 1.553.97 2.921 2.45 3.742L4.8 14l2.37-1.57C7.69 12.48 8.337 12.5 9 12.5c3.314 0 6-2.01 6-4.5S12.314 4 9 4z" fill="#FFE812"/>
              </svg>
            </span>
            카카오톡 공유
          </button>
          <button className={styles.copyBtn} onClick={handleCopyUrl}>
            {copied ? '복사됨 ✓' : 'URL 복사'}
          </button>
          <button className={styles.printBtn} onClick={() => window.print()}>
            PDF 다운로드
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaBox}>
        <p className={styles.ctaTitle}>내 자산도 지금 바로 진단하세요</p>
        <p className={styles.ctaDesc}>
          M-DEENO는 귀하의 자산 기준으로 분담금 위험도와 협상 전략을 자동 분석합니다.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          내 분담금 분석 시작하기
        </Link>
      </div>

      <p className={styles.disclaimer}>
        본 결과는 입력값 기반 시뮬레이션이며 법적 자문에 해당하지 않습니다.
      </p>
    </div>
  );
}
