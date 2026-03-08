import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다' }, { status: 400 });
  }

  const { email } = body;

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error } = await supabase.from('leads').insert([{
    email:        email.trim().toLowerCase().slice(0, 254),
    product_type: 'blog_waitlist',
    beta:         true,
    created_at:   new Date().toISOString(),
  }]);

  if (error) {
    console.error('waitlist DB error:', error.message);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
