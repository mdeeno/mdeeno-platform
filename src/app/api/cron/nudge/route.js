// /api/cron/nudge — 매일 오전 9시(KST) 실행
// 3일 후: 이메일 2 (동등급 절감 사례)
// 7일 후: 이메일 3 (마지막 기회 + 할인 코드)

import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';
import { resend, FROM }  from '@/lib/resend';
import { buildEmail2 }   from '@/lib/emails/email2-peer';
import { buildEmail3 }   from '@/lib/emails/email3-urgency';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export async function GET(req) {
  // Vercel Cron 인증 확인
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const day3 = daysAgo(3);
  const day7 = daysAgo(7);

  let sent2 = 0, sent3 = 0, errors = 0;

  // ── 이메일 2: 3일 전 신청자 ──────────────────────────────────────────
  const { data: leads2 } = await supabase
    .from('leads')
    .select('email, risk_grade')
    .gte('created_at', `${day3}T00:00:00Z`)
    .lte('created_at', `${day3}T23:59:59Z`)
    .is('email_2_sent_at', null);

  for (const lead of leads2 ?? []) {
    try {
      const { subject, html } = buildEmail2({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      await supabase
        .from('leads')
        .update({ email_2_sent_at: new Date().toISOString() })
        .eq('email', lead.email)
        .gte('created_at', `${day3}T00:00:00Z`)
        .lte('created_at', `${day3}T23:59:59Z`);
      sent2++;
    } catch {
      errors++;
    }
  }

  // ── 이메일 3: 7일 전 신청자 ──────────────────────────────────────────
  const { data: leads3 } = await supabase
    .from('leads')
    .select('email, risk_grade')
    .gte('created_at', `${day7}T00:00:00Z`)
    .lte('created_at', `${day7}T23:59:59Z`)
    .is('email_3_sent_at', null);

  for (const lead of leads3 ?? []) {
    try {
      const { subject, html } = buildEmail3({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      await supabase
        .from('leads')
        .update({ email_3_sent_at: new Date().toISOString() })
        .eq('email', lead.email)
        .gte('created_at', `${day7}T00:00:00Z`)
        .lte('created_at', `${day7}T23:59:59Z`);
      sent3++;
    } catch {
      errors++;
    }
  }

  console.log(`nudge cron: email2=${sent2}, email3=${sent3}, errors=${errors}`);
  return NextResponse.json({ ok: true, sent2, sent3, errors });
}
