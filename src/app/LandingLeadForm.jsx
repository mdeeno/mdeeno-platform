'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const BENEFITS = [
  '6월 정식 출시 시 결제 링크 우선 발송',
  '사전 신청자 한정 — 기본 25% · 프리미엄 34% 할인',
  '공사비 상승 시 분석 업데이트 알림 수신',
];

const PHONE_DISPLAY_RE = /^01[016789]-\d{3,4}-\d{4}$/;

function formatPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4)  return digits;
  if (digits.length < 8)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function LandingLeadForm() {
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [error, setError]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  function handlePhoneChange(e) {
    setPhone(formatPhoneInput(e.target.value));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (phone && !PHONE_DISPLAY_RE.test(phone)) {
      setError('올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/lead-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim(),
          phone:        phone || undefined,
          product_type: 'landing_beta',
          beta:         true,
        }),
      });
      setSubmitted(true);
    } catch {
      setError('잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.landingLead}>
      <div className={styles.container}>
        {submitted ? (
          <div className={styles.landingLeadSuccessBox}>
            <p className={styles.landingLeadSuccessTitle}>신청이 완료되었습니다 ✓</p>
            <p className={styles.landingLeadSuccessDesc}>
              6월 정식 출시 시 할인 결제 링크를 이메일로 보내드립니다.
            </p>
            <Link href="/member" className={styles.landingLeadSuccessBtn}>
              지금 바로 무료 분담금 계산하기 →
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.landingLeadEyebrow}>6월 출시 예정</p>
            <p className={styles.landingLeadTitle}>
              출시 전, 이메일만 남겨두세요
            </p>
            <p className={styles.landingLeadDesc}>
              정식 출시 시 할인 결제 링크를 가장 먼저 받아보실 수 있습니다.
            </p>

            <ul className={styles.landingLeadBenefits}>
              {BENEFITS.map((b) => (
                <li key={b} className={styles.landingLeadBenefit}>
                  <span className={styles.landingLeadBenefitIcon}>✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <form className={styles.landingLeadForm} onSubmit={handleSubmit} noValidate>
              <input
                className={`${styles.landingLeadInput}${error ? ` ${styles.landingLeadInputError}` : ''}`}
                type="email"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
              />
              <div className={styles.landingLeadPhoneWrap}>
                <label className={styles.landingLeadPhoneLabel} htmlFor="landing_phone">
                  휴대폰 번호 <span className={styles.landingLeadPhoneOpt}>(선택)</span>
                </label>
                <input
                  className={`${styles.landingLeadInput}${error && phone ? ` ${styles.landingLeadInputError}` : ''}`}
                  id="landing_phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  inputMode="numeric"
                />
                <p className={styles.landingLeadPhoneHint}>서비스 오픈 시 알림톡으로 먼저 안내해 드립니다</p>
              </div>
              <button
                className={styles.landingLeadBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? '처리 중...' : '출시 알림 신청하기'}
              </button>
            </form>
            {error && <p className={styles.landingLeadError}>{error}</p>}

            <p className={styles.landingLeadAlt}>
              지금 바로 사용하고 싶다면?{' '}
              <Link href="/member" className={styles.landingLeadAltLink}>
                무료 분담금 계산 시작 →
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
