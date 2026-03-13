/**
 * src/lib/security.js
 * 공통 보안 유틸리티 — 서버 전용
 *
 * 포함 기능:
 *  - CSRF 방어: 허용된 Origin 검증
 *  - 관리자/cron 인증: CRON_SECRET 검증
 *  - orderId 형식 검증
 *  - 클라이언트 IP 추출
 */

import { NextResponse } from 'next/server';
import { ORDER_ID_REGEX } from '@/lib/constants';

/**
 * 허용된 Origin 목록을 환경변수에서 읽어온다.
 * ALLOWED_ORIGINS 환경변수: 콤마 구분 URL 목록
 * 예) https://mdeeno.com,https://www.mdeeno.com,http://localhost:3000
 */
function getAllowedOrigins() {
  const rawEnvValue = process.env.ALLOWED_ORIGINS ?? '';
  if (rawEnvValue) {
    return new Set(rawEnvValue.split(',').map((origin) => origin.trim()).filter(Boolean));
  }
  // 환경변수 미설정 시 프로덕션 도메인만 허용
  return new Set(['https://mdeeno.com', 'https://www.mdeeno.com']);
}

/**
 * CSRF 방어: POST 요청의 Origin 헤더가 허용된 도메인인지 확인한다.
 * - Origin 헤더가 없으면 서버 간(server-to-server) 요청으로 간주하고 허용한다.
 * - 허용되지 않은 Origin이면 403 응답을 반환한다.
 * - 허용되면 null을 반환한다 (계속 진행).
 *
 * @param {Request} req
 * @returns {NextResponse | null}
 */
export function blockCrossOriginRequest(req) {
  const requestOrigin = req.headers.get('origin');

  // Origin 헤더가 없으면 서버 간 요청 — 허용
  if (!requestOrigin) return null;

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.has(requestOrigin)) {
    return NextResponse.json(
      { error: '허용되지 않은 출처의 요청입니다' },
      { status: 403 },
    );
  }

  return null;
}

/**
 * 관리자/cron 엔드포인트 인증: Authorization 헤더의 Bearer 토큰을 검증한다.
 * CRON_SECRET 환경변수와 일치해야 통과된다.
 *
 * @param {Request} req
 * @returns {NextResponse | null}
 */
export function blockUnauthorizedAdmin(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET 환경변수가 설정되지 않았습니다');
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
  }

  const authorizationHeader = req.headers.get('authorization');
  const expectedToken       = `Bearer ${cronSecret}`;

  if (authorizationHeader !== expectedToken) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다' }, { status: 401 });
  }

  return null;
}

/**
 * orderId 형식 검증: mdeeno_YYYYMMDD_XXXXXXXXXX
 *
 * @param {unknown} orderId
 * @returns {boolean}
 */
export function isValidOrderId(orderId) {
  return typeof orderId === 'string' && ORDER_ID_REGEX.test(orderId);
}

/**
 * 클라이언트 IP 추출 (로깅 및 rate limit에 활용)
 * Vercel은 x-forwarded-for 헤더로 실제 IP를 전달한다.
 *
 * @param {Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return req.headers.get('x-real-ip') ?? 'unknown';
}
