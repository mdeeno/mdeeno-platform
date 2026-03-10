import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend, FROM } from '@/lib/resend';
import { buildEmail1 } from '@/lib/emails/email1-welcome';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다' }, { status: 400 });
  }

  const { email, asset_value, expected_extra, risk_grade } = body;

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다' }, { status: 400 });
  }

  const record = {
    email:          email.trim().toLowerCase().slice(0, 254),
    asset_value:    typeof asset_value    === 'number' ? asset_value    : null,
    expected_extra: typeof expected_extra === 'number' ? expected_extra : null,
    risk_grade:     typeof risk_grade     === 'string' ? risk_grade.slice(0, 10) : null,
  };

  try {
    const { error } = await supabase.from('member_beta_requests').insert([record]);
    if (error) throw error;
  } catch (err) {
    console.error('member-beta-request DB error:', err.message ?? err);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }

  // 이메일 1 발송 — DB 실패와 무관하게 응답 반환
  try {
    const { subject, html } = buildEmail1({
      email:         record.email,
      riskGrade:     record.risk_grade,
      assetValue:    record.asset_value,
      expectedExtra: record.expected_extra,
    });
    await resend.emails.send({ from: FROM, to: record.email, subject, html });
  } catch (err) {
    console.error('member-beta-request email error:', err.message ?? err);
  }

  return NextResponse.json({ success: true });
}