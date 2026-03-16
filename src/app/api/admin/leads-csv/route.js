// /api/admin/leads-csv — 베타 신청자 목록 CSV 다운로드
// Authorization: Bearer {CRON_SECRET}

import { NextResponse }            from 'next/server';
import { createClient }            from '@supabase/supabase-js';
import { blockUnauthorizedAdmin }  from '@/lib/security';

export async function GET(req) {
  const authError = blockUnauthorizedAdmin(req);
  if (authError) return authError;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data, error } = await supabase
    .from('leads')
    .select('email, phone, product_type, risk_grade, complex_name, location, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('leads-csv fetch error:', error.message);
    return NextResponse.json({ error: 'DB 조회 실패' }, { status: 500 });
  }

  const header = ['이메일', '휴대폰번호', '상품유형', '위험등급', '단지명', '지역', '신청일시'];
  const rows = data.map((r) => [
    r.email              ?? '',
    r.phone              ?? '',
    r.product_type       ?? '',
    r.risk_grade         ?? '',
    r.complex_name       ?? '',
    r.location           ?? '',
    r.created_at         ?? '',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  return new Response('\uFEFF' + csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mdeeno_leads_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
