import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    const backendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/v1/member-report'
        : 'https://prop-logic-engine-v2.onrender.com/v1/member-report';

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
      throw new Error('PDF 생성 실패');
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="M-DEENO_개인리포트.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: '리포트 생성 실패' }, { status: 500 });
  }
}
