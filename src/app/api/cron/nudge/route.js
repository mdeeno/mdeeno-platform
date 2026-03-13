// /api/cron/nudge — 매일 오전 9시(KST) 실행
// D+3: 이메일 2 (동등급 절감 사례)
// D+7: 이메일 3-urgency (마지막 할인 코드)

import { NextResponse }          from 'next/server';
import { createClient }          from '@supabase/supabase-js';
import { resend, FROM }          from '@/lib/resend';
import { buildEmail2 }           from '@/lib/emails/email2-peer';
import { buildEmail3 }           from '@/lib/emails/email3-urgency';
import { blockUnauthorizedAdmin } from '@/lib/security';

function daysAgo(numberOfDays) {
  const date = new Date();
  date.setDate(date.getDate() - numberOfDays);
  return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export async function GET(req) {
  const authError = blockUnauthorizedAdmin(req);
  if (authError) return authError;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const day3 = daysAgo(3);
  const day7 = daysAgo(7);
  const now   = new Date().toISOString();

  let sent2 = 0, sent3u = 0, errors = 0;

  // ── 이메일 2: D+3 신청자 ────────────────────────────────────────────
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
        .update({ email_2_sent_at: now })
        .eq('email', lead.email)
        .gte('created_at', `${day3}T00:00:00Z`)
        .lte('created_at', `${day3}T23:59:59Z`);
      sent2++;
    } catch {
      errors++;
    }
  }

  // ── 이메일 3-urgency: D+7 신청자 (할인 코드 + 마감 안내) ────────────
  // launch 이메일 수신 여부와 무관하게 D+7 도달 시 발송
  const { data: leads3u } = await supabase
    .from('leads')
    .select('email, risk_grade')
    .gte('created_at', `${day7}T00:00:00Z`)
    .lte('created_at', `${day7}T23:59:59Z`)
    .is('email_3_urgency_sent_at', null);

  for (const lead of leads3u ?? []) {
    try {
      const { subject, html } = buildEmail3({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      await supabase
        .from('leads')
        .update({ email_3_urgency_sent_at: now })
        .eq('email', lead.email)
        .gte('created_at', `${day7}T00:00:00Z`)
        .lte('created_at', `${day7}T23:59:59Z`);
      sent3u++;
    } catch {
      errors++;
    }
  }

  console.log(`nudge cron: email2=${sent2}, email3u=${sent3u}, errors=${errors}`);
  return NextResponse.json({ ok: true, sent2, sent3u, errors });
}
