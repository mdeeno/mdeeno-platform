import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM } from '@/lib/resend';
import { buildEmail1 } from '@/lib/emails/email1-welcome';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^010\d{7,8}$/;
const ALLOWED_PRODUCT_TYPES = new Set([
  'basic', 'basic_beta', 'premium', 'premium_beta',
  'landing_beta', 'blog_waitlist',
]);
const ALLOWED_STAGES = new Set([
  'planning', 'approval', 'management', 'construction',
]);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다' }, { status: 400 });
  }

  const {
    email, phone, product_type,
    asset_value, expected_extra, risk_grade,
    complex_name, project_stage,
    traffic_source, beta,
  } = body;

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다' }, { status: 400 });
  }

  const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

  const record = {
    email:          email.trim().toLowerCase().slice(0, 254),
    phone:          cleanPhone && PHONE_RE.test(cleanPhone) ? cleanPhone : null,
    product_type:   ALLOWED_PRODUCT_TYPES.has(product_type) ? product_type : null,
    asset_value:    typeof asset_value    === 'number' ? asset_value    : null,
    expected_extra: typeof expected_extra === 'number' ? expected_extra : null,
    risk_grade:     typeof risk_grade     === 'string' ? risk_grade.slice(0, 10) : null,
    complex_name:   typeof complex_name   === 'string' ? complex_name.slice(0, 100) : null,
    project_stage:  ALLOWED_STAGES.has(project_stage)  ? project_stage : null,
    traffic_source: typeof traffic_source === 'string' ? traffic_source.slice(0, 500) : null,
    beta:           typeof beta           === 'boolean' ? beta : false,
    created_at:     new Date().toISOString(),
  };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error } = await supabase.from('leads').insert([record]);

  if (error) {
    console.error('lead-submit DB error:', error.message);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }

  // 이메일 1 즉시 발송 (실패해도 응답에 영향 없음)
  try {
    const { subject, html } = buildEmail1({
      email:         record.email,
      riskGrade:     record.risk_grade,
      assetValue:    record.asset_value,
      expectedExtra: record.expected_extra,
    });
    await resend.emails.send({ from: FROM, to: record.email, subject, html });
  } catch (emailErr) {
    console.error('email1 send error:', emailErr.message);
  }

  return NextResponse.json({ success: true });
}