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
    const { buffer } = await fetchPdfFromBackend('/v1/report', body, origin);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="M-DEENO_Report.pdf"`,
      },
    });
  } catch (err) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err }, { status });
  }
}
