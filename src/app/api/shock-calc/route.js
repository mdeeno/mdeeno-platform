import { NextResponse } from 'next/server';
import { fetchJsonFromBackend } from '@/lib/backend';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: '요청 형식이 올바르지 않습니다' },
      { status: 400 },
    );
  }

  const origin = req.headers.get('origin') ?? 'https://mdeeno.com';

  try {
    const result = await fetchJsonFromBackend('/v1/shock-calc', body, origin);
    return NextResponse.json(result);
  } catch (err) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err.message ?? '분석에 실패했습니다' }, { status });
  }
}
