import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();

  const backendUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8000/v1/member-premium-report'
      : 'https://prop-logic-engine-v2.onrender.com/v1/member-premium-report';

  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: req.headers.get('origin') || 'https://mdeeno.com',
    },
    body: JSON.stringify(body),
  });

  const pdfBuffer = await response.arrayBuffer();

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="M-DEENO_프리미엄전략패키지.pdf"',
    },
  });
}
