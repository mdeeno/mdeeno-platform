import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    const backendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/v1/member-report'
        : 'https://prop-logic-engine-v2.onrender.com/v1/member-report';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);
    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: origin,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let detail = 'PDF 생성 실패';
      try {
        const errBody = await response.json();
        if (typeof errBody.detail === 'string') detail = errBody.detail;
      } catch {}
      return NextResponse.json({ error: detail }, { status: response.status });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="M-DEENO_Member_Report.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
