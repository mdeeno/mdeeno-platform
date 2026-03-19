'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const BENEFITS = [
  '6월 정식 출시 시 결제 링크 우선 발송',
  '사전 신청자 한정 — 기본 25% · 프리미엄 34% 할인',
  '서비스 업데이트 · 신기능 출시 알림 우선 수신',
];

function getPhoneDigits(val) {
  return val.replace(/\D/g, '');
}

function isValidPhone(val) {
  const digits = getPhoneDigits(val);
  return /^01[016789]\d{7,8}$/.test(digits);
}

function formatPhoneInput(raw) {
  const digits = getPhoneDigits(raw).slice(0, 11);
  if (digits.length < 4)  return digits;
  if (digits.length < 8)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function LandingLeadForm() {
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
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
      setError('이메일 주소를 다시 확인해 주세요. 예) hong@email.com');
      return;
    }
    if (!phone || !isValidPhone(phone)) {
      setError('휴대폰 번호 11자리를 입력해 주세요. 예) 010-1234-5678');
      return;
    }
    if (!privacyAgreed) {
      setError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/lead-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim(),
          phone:        phone,
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
              내 분담금 정밀 진단 시작하기 →
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.landingLeadEyebrow}>6월 출시 예정</p>
            <p className={styles.landingLeadTitle}>
              출시 전, 연락처만 남겨두세요
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
              <input
                className={`${styles.landingLeadInput}${error ? ` ${styles.landingLeadInputError}` : ''}`}
                id="landing_phone"
                type="tel"
                placeholder="휴대폰 번호 (010-0000-0000)"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
                inputMode="numeric"
                required
              />
              <label className={styles.landingLeadPrivacy}>
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => { setPrivacyAgreed(e.target.checked); setError(''); }}
                />
                <span className={styles.landingLeadPrivacyText}>
                  개인정보 수집·이용에 동의합니다 (이메일·휴대폰 번호 수집, 출시 안내 목적)
                </span>
              </label>
              <button
                className={styles.landingLeadBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? '처리 중...' : '출시 알림 신청하기'}
              </button>
            </form>
            <p className={styles.landingLeadPhoneHint}>출시 시 이메일과 알림톡으로 가장 먼저 안내해 드립니다</p>
            {error && <p className={styles.landingLeadError}>{error}</p>}

            <p className={styles.landingLeadAlt}>
              지금 바로 사용하고 싶다면?{' '}
              <Link href="/member" className={styles.landingLeadAltLink}>
                분담금 정밀 진단 시작 →
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
