'use client';

import { useEffect, useState } from 'react';
import { useSearchParams }     from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId    = searchParams.get('orderId');
    const amount     = Number(searchParams.get('amount'));

    if (!paymentKey || !orderId || !amount) {
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      setStatus('error');
      return;
    }

    fetch('/api/payments/confirm', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
        } else {
          setErrorMsg(data.error ?? '결제 확인 중 오류가 발생했습니다.');
          setStatus('error');
        }
      })
      .catch(() => {
        setErrorMsg('네트워크 오류가 발생했습니다. 고객센터로 문의해 주세요.');
        setStatus('error');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>결제를 확인하고 있습니다...</p>
          <p className={styles.loadingNote}>잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>✕</div>
          <h1 className={styles.errorTitle}>결제 확인 실패</h1>
          <p className={styles.errorMsg}>{errorMsg}</p>
          <p className={styles.errorNote}>
            결제가 완료되었다면 support@mdeeno.com으로 주문번호와 함께 문의해 주세요.
          </p>
          <Link href="/member" className={styles.retryBtn}>
            계산기로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.successTitle}>결제가 완료되었습니다</h1>
        <p className={styles.successDesc}>
          리포트를 생성하여 <strong>이메일로 발송</strong>하고 있습니다.<br />
          몇 분 내로 입력하신 이메일에서 확인하실 수 있습니다.
        </p>
        <ul className={styles.nextSteps}>
          <li>📧 이메일 받은편지함을 확인하세요</li>
          <li>📁 스팸 폴더도 확인해 주세요</li>
          <li>⏱️ 최대 5분 이내 발송됩니다</li>
        </ul>
        <p className={styles.supportNote}>
          30분 이상 미수신 시 support@mdeeno.com으로 문의해 주세요.
        </p>
        <Link href="/" className={styles.homeBtn}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
