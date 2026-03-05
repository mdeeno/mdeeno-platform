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
    const { buffer, reportId } = await fetchPdfFromBackend('/v1/member-report', body, origin);

    const responseHeaders = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': "attachment; filename*=UTF-8''M-DEENO_%EA%B8%B0%EB%B3%B8%EB%A6%AC%ED%8F%AC%ED%8A%B8.pdf",
    };
    if (reportId) responseHeaders['X-Report-Id'] = reportId;

    return new NextResponse(buffer, { status: 200, headers: responseHeaders });
  } catch (err) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err }, { status });
  }
}
