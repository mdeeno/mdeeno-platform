'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

const ERROR_MESSAGES = {
  PAY_PROCESS_CANCELED:  '결제를 취소하셨습니다.',
  PAY_PROCESS_ABORTED:   '결제 처리 중 오류가 발생했습니다.',
  REJECT_CARD_COMPANY:   '카드사에서 결제가 거절되었습니다.',
  INVALID_STOPPED_CARD:  '정지된 카드입니다.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과하였습니다.',
};

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code    = searchParams.get('code')    ?? '';
  const message = searchParams.get('message') ?? '결제에 실패했습니다.';

  const displayMessage = ERROR_MESSAGES[code] ?? message;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✕</div>
        <h1 className={styles.title}>결제에 실패했습니다</h1>
        <p className={styles.message}>{displayMessage}</p>
        <p className={styles.note}>
          문제가 반복된다면 support@mdeeno.com으로 문의해 주세요.
        </p>
        <div className={styles.btnGroup}>
          <button
            className={styles.retryBtn}
            onClick={() => window.history.back()}
          >
            다시 시도하기
          </button>
          <Link href="/member" className={styles.homeBtn}>
            계산기로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.card} /></div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
