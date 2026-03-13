/**
 * src/lib/rateLimiter.js
 * Upstash Redis 기반 Rate Limiter — Edge Runtime 전용 (middleware.js에서 사용)
 *
 * 엔드포인트별 제한:
 *  - 결제 준비/확인: 1분에 5회 (스팸 결제 방지)
 *  - PDF 생성: 1분에 3회 (백엔드 과부하 방지)
 *  - 리드 수집/대기자: 1분에 10회 (이메일 스팸 방지)
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';
import { RATE_LIMIT } from '@/lib/constants';

// ── Redis 클라이언트 (Upstash REST API) ──────────────────────────────────────
// KV_REST_API_URL, KV_REST_API_TOKEN은 Vercel이 Upstash 연동 시 자동 주입
function createRedisClient() {
  const restApiUrl   = process.env.KV_REST_API_URL;
  const restApiToken = process.env.KV_REST_API_TOKEN;

  if (!restApiUrl || !restApiToken) {
    throw new Error('Upstash Redis 환경변수(KV_REST_API_URL, KV_REST_API_TOKEN)가 설정되지 않았습니다');
  }

  return new Redis({ url: restApiUrl, token: restApiToken });
}

// ── 엔드포인트별 Rate Limiter 생성 ──────────────────────────────────────────
// Sliding Window: 현재 시점 기준 과거 N초 동안의 요청 수를 계산 (고정 윈도우보다 부드러움)

function createPaymentRateLimiter(redis) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT.PAYMENT_MAX_REQUESTS_PER_MINUTE,
      '60 s',
    ),
    prefix: 'rl:payment',
  });
}

function createPdfRateLimiter(redis) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT.PDF_MAX_REQUESTS_PER_MINUTE,
      '60 s',
    ),
    prefix: 'rl:pdf',
  });
}

function createLeadRateLimiter(redis) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT.LEAD_MAX_REQUESTS_PER_MINUTE,
      '60 s',
    ),
    prefix: 'rl:lead',
  });
}

// ── 경로별 Rate Limiter 매핑 ─────────────────────────────────────────────────
const RATE_LIMITED_PATHS = [
  { pathPrefix: '/api/payments/prepare',      getLimiter: createPaymentRateLimiter },
  { pathPrefix: '/api/payments/confirm',      getLimiter: createPaymentRateLimiter },
  { pathPrefix: '/api/member-basic-report',   getLimiter: createPdfRateLimiter     },
  { pathPrefix: '/api/member-premium-report', getLimiter: createPdfRateLimiter     },
  { pathPrefix: '/api/lead-submit',           getLimiter: createLeadRateLimiter    },
  { pathPrefix: '/api/waitlist',              getLimiter: createLeadRateLimiter    },
  { pathPrefix: '/api/member-beta-request',   getLimiter: createLeadRateLimiter    },
];

/**
 * 요청 경로에 맞는 Rate Limiter로 제한 여부를 확인한다.
 * - 제한 초과: { limited: true, retryAfterSeconds }
 * - 통과: { limited: false }
 * - Rate Limit 설정 없는 경로: { limited: false }
 *
 * @param {string} pathname  요청 경로 (예: '/api/payments/prepare')
 * @param {string} clientIp  클라이언트 IP
 * @returns {Promise<{ limited: boolean, retryAfterSeconds?: number }>}
 */
export async function checkRateLimit(pathname, clientIp) {
  const matchedPath = RATE_LIMITED_PATHS.find(({ pathPrefix }) =>
    pathname.startsWith(pathPrefix),
  );

  if (!matchedPath) return { limited: false };

  const redis   = createRedisClient();
  const limiter = matchedPath.getLimiter(redis);

  // Rate limit 키: IP + 경로 조합 (경로별로 독립적으로 카운팅)
  const rateLimitKey = `${clientIp}:${matchedPath.pathPrefix}`;
  const { success, reset } = await limiter.limit(rateLimitKey);

  if (success) return { limited: false };

  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1_000);
  return { limited: true, retryAfterSeconds };
}
