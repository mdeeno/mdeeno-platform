import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

  try {
    const { subject, html } = buildEmail1({ email: email.trim().toLowerCase() });
    await resend.emails.send({ from: FROM, to: email.trim(), subject, html });
  } catch (emailErr) {
    console.error('email1 waitlist send error:', emailErr.message);
  }

  return NextResponse.json({ success: true });
}
