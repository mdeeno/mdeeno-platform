// /api/admin/launch — 6/15 결제 오픈 당일 1회 실행
// leads 전체 수신자에게 결제 오픈 이메일 발송

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

  // leads 단일 테이블에서 수집 (member_beta_requests 통합 완료)
  const { data: all } = await supabase
    .from('leads')
    .select('email, risk_grade')
    .is('email_3_sent_at', null);

  let sent = 0, errors = 0;
  const now = new Date().toISOString();
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const lead of all) {
    try {
      const { subject, html } = buildEmail3Launch({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      // Resend 무료 플랜: 초당 2건 제한 대응
      await delay(600);

      await supabase.from('leads')
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
