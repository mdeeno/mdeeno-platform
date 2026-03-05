'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

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
          <Link href="/member" className={styles.ctaBtn}>내 자산 진단하기</Link>
        </div>
      </div>
    );
  }

  const savings = (record.expected_contribution - record.comparison_contribution);
  const riskColor = RISK_COLORS[record.risk_level] ?? '#64748b';

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO Prop-Logic™</p>
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
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>전략 적용 후</span>
          <span className={`${styles.metricValue} ${styles.metricSafe}`}>
            {formatAmount(record.comparison_contribution)}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>예상 절감액</span>
          <span className={`${styles.metricValue} ${styles.metricSafe}`}>
            -{formatAmount(savings)}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Shock Score</span>
          <span className={styles.metricValue} style={{ color: riskColor }}>
            {record.shock_score}<span className={styles.metricUnit}>/100</span>
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaBox}>
        <p className={styles.ctaTitle}>내 자산도 지금 바로 진단하세요</p>
        <p className={styles.ctaDesc}>
          M-DEENO는 귀하의 자산 기준으로 분담금 위험도와 협상 전략을 자동 분석합니다.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          무료 위험도 계산하기
        </Link>
      </div>

      <p className={styles.disclaimer}>
        본 결과는 입력값 기반 시뮬레이션이며 법적 자문에 해당하지 않습니다.
      </p>
    </div>
  );
}
