import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || 'https://mdeeno.com';

    // 로컬 테스트 환경이면 로컬 파이썬 서버로, 아니면 Render 서버로 요청
    const backendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/v1/report'
        : 'https://prop-logic-engine-v2.onrender.com/v1/report';

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
      console.error('🚨 파이썬 백엔드 에러:', response.status, errorText);
      return NextResponse.json(
        { error: '리포트 생성 실패', details: errorText },
        { status: response.status },
      );
    }

    // 핵심: 파이썬이 만든 PDF 파일을 ArrayBuffer(이진 데이터)로 받음
    const pdfBuffer = await response.arrayBuffer();

    // 프론트엔드로 PDF 파일 스트림 그대로 전달
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="M-DEENO_Report.pdf"`,
      },
    });
  } catch (error) {
    console.error('🚨 Next.js 내부 API 에러:', error);
    return NextResponse.json({ error: '서버 내부 연결 실패' }, { status: 500 });
  }
}
