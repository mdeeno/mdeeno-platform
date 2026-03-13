export const SITE_URL = 'https://mdeeno.com';
export const TECH_URL = 'https://tech.mdeeno.com';

// ── 입력값 길이 제한 ────────────────────────────────────────────────────────
export const MAX_EMAIL_LENGTH       = 254; // RFC 5321
export const MAX_COMPLEX_NAME_LENGTH = 100;
export const MAX_LOCATION_LENGTH    = 100;
export const MAX_RISK_GRADE_LENGTH  = 10;
export const MAX_MEMBER_NAME_LENGTH = 50;
export const MAX_TRAFFIC_SOURCE_LENGTH = 500;

// ── orderId 형식: mdeeno_YYYYMMDD_XXXXXXXXXX ────────────────────────────────
export const ORDER_ID_REGEX = /^mdeeno_\d{8}_[A-Z0-9]{10}$/;

// ── Rate limit 설정 (Upstash Redis 연동 시 사용) ────────────────────────────
export const RATE_LIMIT = {
  PAYMENT_MAX_REQUESTS_PER_MINUTE : 5,
  PDF_MAX_REQUESTS_PER_MINUTE     : 3,
  LEAD_MAX_REQUESTS_PER_MINUTE    : 10,
};

// ── 관리자/cron 이메일 발송 딜레이 ──────────────────────────────────────────
// Resend 무료 플랜 초당 2건 제한 대응: 600ms 간격
export const EMAIL_SEND_DELAY_MS = 600;
