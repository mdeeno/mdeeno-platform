import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    const backendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/v1/calc-member'
        : 'https://prop-logic-engine-v2.onrender.com/v1/calc-member';

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '연결 실패' }, { status: 500 });
  }
}
