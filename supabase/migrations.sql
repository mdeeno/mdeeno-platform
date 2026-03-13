-- ============================================================
-- M-DEENO Platform — Supabase 보안 설정
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- ── 1. audit_logs 테이블 생성 ───────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         BIGSERIAL PRIMARY KEY,
  event_type TEXT        NOT NULL,  -- 'order.created', 'payment.confirmed' 등
  order_id   TEXT,
  email      TEXT,
  ip_address TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON audit_logs (event_type);
CREATE INDEX IF NOT EXISTS audit_logs_order_id_idx   ON audit_logs (order_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);


-- ── 2. RLS (Row Level Security) 활성화 ─────────────────────
-- service_role은 RLS를 자동 bypass하므로 서버 코드는 영향 없음
-- ANON_KEY로 직접 접근하는 클라이언트를 차단하는 것이 목적


-- leads 테이블: 외부 직접 접근 완전 차단 (서버 API를 통해서만 접근)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon/authenticated 키로 접근 불가 (기본 deny)


-- orders 테이블: 외부 직접 접근 완전 차단
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon/authenticated 키로 접근 불가 (기본 deny)


-- report_records 테이블: 공개 읽기 허용 (공유 링크 페이지용)
ALTER TABLE report_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_records_public_read" ON report_records;
CREATE POLICY "report_records_public_read"
  ON report_records
  FOR SELECT
  USING (true);
-- INSERT/UPDATE/DELETE는 service_role이 bypass하므로 별도 정책 불필요


-- audit_logs 테이블: 외부 직접 접근 완전 차단
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon/authenticated 키로 접근 불가
