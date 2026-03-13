/**
 * src/lib/auditLog.js
 * 주요 이벤트 감사 로그 기록 — 서버 전용
 *
 * 기록 대상:
 *  - 주문 생성 / 결제 완료 / 결제 실패
 *  - PDF 생성 완료 / 실패
 *  - 이메일 발송 완료 / 실패
 *
 * 설계 원칙:
 *  - writeAuditLog()는 절대 예외를 던지지 않는다 — 로그 실패로 서비스가 중단되면 안 됨
 *  - service_role로만 접근 (RLS로 외부 차단)
 */

import { createClient } from '@supabase/supabase-js';

// ── 감사 이벤트 타입 상수 ────────────────────────────────────────────────────
export const AUDIT_EVENT = {
  ORDER_CREATED      : 'order.created',
  PAYMENT_CONFIRMED  : 'payment.confirmed',
  PAYMENT_FAILED     : 'payment.failed',
  PDF_GENERATED      : 'pdf.generated',
  PDF_FAILED         : 'pdf.failed',
  EMAIL_SENT         : 'email.sent',
  EMAIL_FAILED       : 'email.failed',
};

/**
 * 감사 로그를 audit_logs 테이블에 기록한다.
 * 실패 시 콘솔 경고만 출력하고 조용히 종료 (서비스 영향 없음).
 *
 * @param {{
 *   eventType  : string,   // AUDIT_EVENT 상수 사용
 *   orderId?   : string,
 *   email?     : string,
 *   ipAddress? : string,
 *   metadata?  : object,   // 이벤트별 추가 정보 (자유 형식)
 * }} params
 */
export async function writeAuditLog({ eventType, orderId, email, ipAddress, metadata }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    await supabase.from('audit_logs').insert([{
      event_type : eventType,
      order_id   : orderId   ?? null,
      email      : email     ?? null,
      ip_address : ipAddress ?? null,
      metadata   : metadata  ?? null,
    }]);
  } catch (error) {
    // 로그 기록 실패는 서비스 흐름에 영향 주지 않음
    console.warn(`[audit] 로그 기록 실패 (event: ${eventType}):`, error?.message);
  }
}
