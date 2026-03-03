import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();

    const { error } = await supabase
      .from('member_beta_requests')
      .insert([body]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }
}