import { NextResponse } from 'next/server';
import { fetchJsonFromBackend } from '@/lib/backend';
import { writeAuditLog, AUDIT_EVENT } from '@/lib/auditLog';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: '요청 형식이 올바르지 않습니다' },
      { status: 400 },
    );
  }

  const origin = req.headers.get('origin') ?? 'https://mdeeno.com';

  try {
    const result = await fetchJsonFromBackend('/v1/shock-calc', body, origin);

    // 계산기 사용 로그 (이메일 없이도 사용 추적)
    writeAuditLog({
      eventType: AUDIT_EVENT.CALC_COMPLETED,
      metadata: {
        complex_name:       body.complex_name       || null,
        location:           body.location            || null,
        pyeong:             body.pyeong              || null,
        construction_cost:  body.construction_cost   || null,
        asset_value:        body.asset_value         || null,
        expected_extra:     body.expected_extra      || null,
        cost_increase_rate: body.cost_increase_rate  || null,
        project_stage:      body.project_stage       || null,
        risk_grade:         result.risk_level        || null,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err.message ?? '분석에 실패했습니다' }, { status });
  }
}
