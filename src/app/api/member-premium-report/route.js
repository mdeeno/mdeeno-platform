import { NextResponse } from 'next/server';
import { fetchPdfFromBackend } from '@/lib/backend';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: '요청 형식이 올바르지 않습니다', status: 400 } },
      { status: 400 },
    );
  }

  const origin = req.headers.get('origin') ?? 'https://mdeeno.com';

  try {
    const pdfBuffer = await fetchPdfFromBackend('/v1/member-premium-report', body, origin);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': "attachment; filename*=UTF-8''M-DEENO_%ED%94%84%EB%A6%AC%EB%AF%B8%EC%97%84%EC%A0%84%EB%9E%B5%ED%8C%A8%ED%82%A4%EC%A7%80.pdf",
      },
    });
  } catch (err) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err }, { status });
  }
}
