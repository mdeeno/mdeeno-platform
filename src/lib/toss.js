/**
 * src/lib/toss.js
 * Toss Payments 서버 전용 헬퍼 — 클라이언트 컴포넌트에서 import 금지
 */

// 베타/정식 가격 (원 단위)
export const PRICES = {
  basic:   { beta: 29_000, full: 39_000  },
  premium: { beta: 99_000, full: 149_000 },
};

export const ORDER_NAMES = {
  basic:   'M-DEENO 기본 리포트',
  premium: 'M-DEENO 프리미엄 전략 리포트',
};

/**
 * Toss Payments 결제 최종 승인
 * https://docs.tosspayments.com/reference#결제-승인
 *
 * @param {{ paymentKey: string, orderId: string, amount: number }} params
 * @returns {Promise<object>} Toss 응답 전체
 */
export async function confirmTossPayment({ paymentKey, orderId, amount }) {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다');

  const credentials = Buffer.from(`${secretKey}:`).toString('base64');

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw {
      code:    data.code    ?? 'TOSS_ERROR',
      message: data.message ?? '결제 승인에 실패했습니다',
      status:  res.status,
    };
  }

  return data;
}
