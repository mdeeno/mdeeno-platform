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
    const { buffer, reportId } = await fetchPdfFromBackend('/v1/member-premium-report', body, origin);

    const responseHeaders = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': "attachment; filename*=UTF-8''M-DEENO_%ED%94%84%EB%A6%AC%EB%AF%B8%EC%97%84%EC%A0%84%EB%9E%B5%ED%8C%A8%ED%82%A4%EC%A7%80.pdf",
    };
    if (reportId) responseHeaders['X-Report-Id'] = reportId;

    return new NextResponse(buffer, { status: 200, headers: responseHeaders });
  } catch (err) {
    const status = err.status ?? 500;
    const error = { code: err.code ?? 'SERVER_ERROR', message: err.message ?? 'PDF 생성 중 오류가 발생했습니다' };
    return NextResponse.json({ error }, { status });
  }
}
