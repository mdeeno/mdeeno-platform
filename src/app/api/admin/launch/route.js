// /api/admin/launch — 6/15 결제 오픈 당일 1회 실행
// leads + member_beta_requests 전체 수신자에게 결제 오픈 이메일 발송

import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';
import { resend, FROM }  from '@/lib/resend';
import { buildEmail3Launch } from '@/lib/emails/email3-launch';

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // leads + member_beta_requests 전체 수집
  const [{ data: leads }, { data: betaReqs }] = await Promise.all([
    supabase.from('leads').select('email, risk_grade').is('email_3_sent_at', null),
    supabase.from('member_beta_requests').select('email, risk_grade').is('email_3_sent_at', null),
  ]);

  // 이메일 중복 제거
  const seen  = new Set();
  const all   = [...(leads ?? []), ...(betaReqs ?? [])].filter(r => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });

  let sent = 0, errors = 0;
  const now = new Date().toISOString();
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const lead of all) {
    try {
      const { subject, html } = buildEmail3Launch({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      // Resend 무료 플랜: 초당 2건 제한 대응
      await delay(600);

      // 발송 완료 표시
      await supabase.from('leads')
        .update({ email_3_sent_at: now })
        .eq('email', lead.email);
      await supabase.from('member_beta_requests')
        .update({ email_3_sent_at: now })
        .eq('email', lead.email);

      sent++;
    } catch {
      errors++;
    }
  }

  console.log(`launch email: total=${all.length}, sent=${sent}, errors=${errors}`);
  return NextResponse.json({ ok: true, total: all.length, sent, errors });
}
