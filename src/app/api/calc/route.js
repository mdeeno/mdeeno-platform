import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    const response = await fetch(
      'https://prop-logic-engine.onrender.com/v1/calc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: origin,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    );

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
