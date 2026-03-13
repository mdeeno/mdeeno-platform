// /api/admin/launch — 6/15 결제 오픈 당일 1회 실행
// leads 전체 수신자에게 결제 오픈 이메일 발송

import { NextResponse }          from 'next/server';
import { createClient }          from '@supabase/supabase-js';
import { resend, FROM }          from '@/lib/resend';
import { buildEmail3Launch }     from '@/lib/emails/email3-launch';
import { blockUnauthorizedAdmin } from '@/lib/security';
import { EMAIL_SEND_DELAY_MS }   from '@/lib/constants';

export async function POST(req) {
  const authError = blockUnauthorizedAdmin(req);
  if (authError) return authError;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // leads 단일 테이블에서 수집 (member_beta_requests 통합 완료)
  const { data: allLeads } = await supabase
    .from('leads')
    .select('email, risk_grade')
    .is('email_3_sent_at', null);

  let sentCount  = 0;
  let errorCount = 0;
  const sentAt   = new Date().toISOString();
  const delay    = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const lead of allLeads) {
    try {
      const { subject, html } = buildEmail3Launch({ riskGrade: lead.risk_grade });
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });

      // Resend 무료 플랜 초당 2건 제한 대응
      await delay(EMAIL_SEND_DELAY_MS);

      await supabase
        .from('leads')
        .update({ email_3_sent_at: sentAt })
        .eq('email', lead.email);

      sentCount++;
    } catch {
      errorCount++;
    }
  }

  console.log(`launch email: total=${allLeads.length}, sent=${sentCount}, errors=${errorCount}`);
  return NextResponse.json({ ok: true, total: allLeads.length, sent: sentCount, errors: errorCount });
}
