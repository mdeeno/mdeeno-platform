/**
 * src/middleware.js
 * Next.js Edge Middleware — 모든 요청에 적용
 *
 * 역할:
 *  1. 보안 응답 헤더 추가 (클릭재킹, MIME 스니핑 방지 등)
 *  2. 민감 API 엔드포인트에 CSRF 방어 (Origin 헤더 검증)
 */

import { NextResponse } from 'next/server';

// ── 보안 헤더 (모든 응답에 적용) ────────────────────────────────────────────
const SECURITY_RESPONSE_HEADERS = {
  'X-Frame-Options'         : 'DENY',               // 클릭재킹 방지
  'X-Content-Type-Options'  : 'nosniff',            // MIME 스니핑 방지
  'Referrer-Policy'         : 'strict-origin-when-cross-origin',
  'Permissions-Policy'      : 'camera=(), microphone=(), geolocation=()',
};

// ── CSRF 방어 대상 API 경로 (POST 요청만 검사) ───────────────────────────────
const CSRF_PROTECTED_API_PATHS = [
  '/api/payments/prepare',
  '/api/payments/confirm',
  '/api/member-basic-report',
  '/api/member-premium-report',
  '/api/lead-submit',
  '/api/waitlist',
  '/api/member-beta-request',
];

/**
 * 허용된 Origin 목록을 환경변수에서 읽어온다.
 * ALLOWED_ORIGINS: 콤마 구분 URL 목록
 * 예) https://mdeeno.com,https://www.mdeeno.com,http://localhost:3000
 */
function getAllowedOrigins() {
  const rawEnvValue = process.env.ALLOWED_ORIGINS ?? '';
  if (rawEnvValue) {
    return new Set(rawEnvValue.split(',').map((o) => o.trim()).filter(Boolean));
  }
  return new Set(['https://mdeeno.com', 'https://www.mdeeno.com']);
}

export function middleware(request) {
  const { pathname, method } = request.nextUrl
    ? { pathname: request.nextUrl.pathname, method: request.method }
    : { pathname: '', method: request.method };

  // ── CSRF 방어 ─────────────────────────────────────────────────────────────
  const isCsrfProtectedPath = CSRF_PROTECTED_API_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (request.method === 'POST' && isCsrfProtectedPath) {
    const requestOrigin = request.headers.get('origin');

    if (requestOrigin) {
      const allowedOrigins = getAllowedOrigins();
      if (!allowedOrigins.has(requestOrigin)) {
        return NextResponse.json(
          { error: '허용되지 않은 출처의 요청입니다' },
          { status: 403 },
        );
      }
    }
  }

  // ── 보안 헤더 적용 ────────────────────────────────────────────────────────
  const response = NextResponse.next();
  Object.entries(SECURITY_RESPONSE_HEADERS).forEach(([headerName, headerValue]) => {
    response.headers.set(headerName, headerValue);
  });

  return response;
}

export const config = {
  // 정적 파일(_next/static, 이미지, favicon) 제외한 모든 경로에 적용
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
