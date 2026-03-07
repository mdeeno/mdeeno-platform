import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('lead-count error:', error.message);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
