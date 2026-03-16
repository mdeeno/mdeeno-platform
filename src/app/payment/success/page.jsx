'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status,     setStatus]     = useState('loading'); // loading | success | error
  const [errorMsg,   setErrorMsg]   = useState('');
  const [orderId,    setOrderId]    = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone,    setPdfDone]    = useState(false);
  const [pdfError,   setPdfError]   = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const oid        = searchParams.get('orderId');
    const amount     = Number(searchParams.get('amount'));

    if (!paymentKey || !oid || !amount) {
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      setStatus('error');
      return;
    }

    const controller = new AbortController();

    fetch('/api/payments/confirm', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paymentKey, orderId: oid, amount }),
      signal:  controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrderId(data.orderId ?? oid);
          setStatus('success');
        } else {
          setErrorMsg(data.error ?? '결제 확인 중 오류가 발생했습니다.');
          setStatus('error');
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setErrorMsg('네트워크 오류가 발생했습니다. 고객센터로 문의해 주세요.');
        setStatus('error');
      });

    return () => controller.abort();
  }, [searchParams]);

  async function handleDownload() {
    setPdfLoading(true);
    setPdfError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'PDF 다운로드에 실패했습니다.');
      }

      // Content-Disposition에서 파일명 추출
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match       = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
      const filename    = match ? decodeURIComponent(match[1]) : 'M-DEENO_리포트.pdf';

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfDone(true);
    } catch (err) {
      setPdfError(err.message);
    } finally {
      setPdfLoading(false);
    }
  }

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
          리포트를 지금 바로 다운로드하거나,<br />
          잠시 후 이메일로도 받아보실 수 있습니다.
        </p>

        {pdfError && (
          <p className={styles.pdfError}>
            {pdfError}<br />
            <span>이메일 받은편지함을 확인해 주세요.</span>
          </p>
        )}

        <button
          className={styles.downloadBtn}
          onClick={handleDownload}
          disabled={pdfLoading || pdfDone}
        >
          {pdfLoading ? (
            <span className={styles.downloadBtnInner}>
              <span className={styles.btnSpinner} />
              리포트 생성 중... (최대 1분 소요)
            </span>
          ) : pdfDone ? (
            '다운로드 완료 ✓'
          ) : (
            '리포트 지금 다운로드 →'
          )}
        </button>

        {pdfDone && (
          <p className={styles.pdfDoneNote}>
            다운로드 폴더를 확인하세요. 이메일로도 별도 발송됩니다.
          </p>
        )}

        {!pdfDone && (
          <p className={styles.emailNote}>
            📧 이메일로도 발송됩니다 (수 분 내, 스팸 폴더 확인)
          </p>
        )}

        <p className={styles.supportNote}>
          10분 이상 미수신 시 support@mdeeno.com으로 문의해 주세요.
        </p>
        <Link href="/" className={styles.homeBtn}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.card} /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
