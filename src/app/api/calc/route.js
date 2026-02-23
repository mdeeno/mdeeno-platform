import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    const backendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/v1/report'
        : 'https://prop-logic-engine-v2.onrender.com/v1/calc';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 Render 백엔드 에러:', response.status, errorText);
      return NextResponse.json(
        { error: '백엔드 에러', details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('🚨 Next.js 내부 API 에러:', error);
    return NextResponse.json({ error: '서버 내부 연결 실패' }, { status: 500 });
  }
}
