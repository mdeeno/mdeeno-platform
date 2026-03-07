import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('member-beta-request DB error:', err.message ?? err);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }
}