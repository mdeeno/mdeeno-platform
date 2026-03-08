'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LandingLeadForm() {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/lead-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim(),
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
          <p className={styles.landingLeadSuccess}>
            신청 완료. 정식 출시 시 이메일로 안내드립니다.
          </p>
        ) : (
          <>
            <p className={styles.landingLeadTitle}>
              6월 정식 출시 알림 받기
            </p>
            <p className={styles.landingLeadDesc}>
              베타 가격(최대 40% 할인)은 사전 신청자에게만 제공됩니다.
            </p>
            <form className={styles.landingLeadForm} onSubmit={handleSubmit} noValidate>
              <input
                className={`${styles.landingLeadInput}${error ? ` ${styles.landingLeadInputError}` : ''}`}
                type="email"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
              />
              <button
                className={styles.landingLeadBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? '처리 중...' : '사전 신청하기'}
              </button>
            </form>
            {error && <p className={styles.landingLeadError}>{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}
