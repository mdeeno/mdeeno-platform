/**
 * POST /api/payments/prepare
 * 결제 준비: orderId 생성 + orders INSERT(pending) + Toss 결제창 파라미터 반환
 */

import { NextResponse } from 'next/server';
import { isBetaMode }   from '@/lib/feature-flags';
import { PRICES, ORDER_NAMES } from '@/lib/toss';
import { createOrder }  from '@/lib/orders';
import { writeAuditLog, AUDIT_EVENT } from '@/lib/auditLog';
import { getClientIp }  from '@/lib/security';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^010\d{7,8}$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mdeeno.com';

function makeOrderId() {
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand  = Math.random().toString(36).slice(2, 12).toUpperCase();
  return `mdeeno_${date}_${rand}`;
}

export async function POST(req) {
  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: '요청 형식이 올바르지 않습니다' }, { status: 400 }); }

  const {
    email, phone, product_type,
    asset_value, expected_extra, risk_grade,
    complex_name, member_name, location, construction_cost,
    traffic_source,
  } = body;

  // 검증
  if (!email || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다' }, { status: 400 });
  }
  if (!['basic', 'premium'].includes(product_type)) {
    return NextResponse.json({ error: '유효하지 않은 상품입니다' }, { status: 400 });
  }

  const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  const beta       = isBetaMode();
  const amount     = beta ? PRICES[product_type].beta : PRICES[product_type].full;
  const orderId    = makeOrderId();

  const clientIp = getClientIp(req);

  // orders INSERT
  try {
    await createOrder({
      orderId,
      productType:      product_type,
      amount,
      isBeta:           beta,
      email:            email.trim().toLowerCase(),
      phone:            PHONE_RE.test(cleanPhone) ? cleanPhone : null,
      assetValue:       typeof asset_value       === 'number' ? asset_value       : null,
      expectedExtra:    typeof expected_extra    === 'number' ? expected_extra    : null,
      riskGrade:        typeof risk_grade        === 'string' ? risk_grade        : null,
      complexName:      typeof complex_name      === 'string' ? complex_name.slice(0, 100)      : null,
      memberName:       typeof member_name       === 'string' ? member_name.slice(0, 50)        : null,
      location:         typeof location          === 'string' ? location.slice(0, 100)          : null,
      constructionCost: typeof construction_cost === 'number' ? construction_cost : null,
      trafficSource:    typeof traffic_source    === 'string' ? traffic_source.slice(0, 500)    : null,
    });
  } catch (err) {
    console.error('payments/prepare DB error:', err.message ?? err);
    return NextResponse.json({ error: '주문 생성에 실패했습니다' }, { status: 500 });
  }

  await writeAuditLog({
    eventType : AUDIT_EVENT.ORDER_CREATED,
    orderId   : orderId,
    email     : email.trim().toLowerCase(),
    ipAddress : clientIp,
    metadata  : { productType: product_type, amount, isBeta: beta },
  });

  // Toss 결제창 파라미터 반환
  return NextResponse.json({
    orderId,
    orderName:     ORDER_NAMES[product_type],
    amount,
    customerEmail: email.trim().toLowerCase(),
    customerName:  typeof member_name === 'string' && member_name.trim() ? member_name.trim() : '조합원',
    successUrl:    `${SITE_URL}/payment/success`,
    failUrl:       `${SITE_URL}/payment/fail`,
  });
}
