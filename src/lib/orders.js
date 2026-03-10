/**
 * src/lib/orders.js
 * orders 테이블 CRUD — 서버 전용 (SUPABASE_SERVICE_ROLE_KEY 사용)
 */

import { createClient } from '@supabase/supabase-js';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * 주문 생성 (pending)
 */
export async function createOrder({
  orderId,
  productType,
  amount,
  isBeta,
  email,
  phone,
  assetValue,
  expectedExtra,
  riskGrade,
  complexName,
  memberName,
  location,
  constructionCost,
  trafficSource,
}) {
  const supabase = getClient();
  const { error } = await supabase.from('orders').insert([{
    order_id:          orderId,
    product_type:      productType,
    amount,
    is_beta:           isBeta,
    email,
    phone:             phone || null,
    asset_value:       assetValue    ?? null,
    expected_extra:    expectedExtra ?? null,
    risk_grade:        riskGrade     ?? null,
    complex_name:      complexName   ?? null,
    member_name:       memberName    ?? null,
    location:          location      ?? null,
    construction_cost: constructionCost ?? null,
    traffic_source:    trafficSource ?? null,
    status:            'pending',
  }]);
  if (error) throw error;
}

/**
 * 주문 상태 업데이트 (paid / failed / cancelled)
 */
export async function updateOrderStatus(orderId, status, tossData = {}) {
  const supabase = getClient();
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      toss_payment_key: tossData.paymentKey   ?? null,
      toss_method:      tossData.method       ?? null,
      toss_approved_at: tossData.approvedAt   ?? null,
    })
    .eq('order_id', orderId);
  if (error) throw error;
}

/**
 * 주문 조회
 */
export async function getOrderById(orderId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * PDF 생성 / 이메일 발송 완료 표시
 */
export async function markOrderDelivered(orderId, { reportId } = {}) {
  const supabase = getClient();
  const { error } = await supabase
    .from('orders')
    .update({
      pdf_generated: true,
      email_sent:    true,
      report_id:     reportId ?? null,
    })
    .eq('order_id', orderId);
  if (error) throw error;
}
