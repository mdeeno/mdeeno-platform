'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { sendGAEvent } from '@next/third-parties/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberCalc() {
  const router = useRouter();

  const [inputs, setInputs] = useState({
    assetValue: '',
    expectedExtra: '',
    costRate: 0.1,
  });

  const [result, setResult] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // ── 공유 링크 생성 ───────────────────────────────────────────
  function handleShare() {
    const id = crypto.randomUUID();
    // 민감 정보(자산액, 분담금)는 저장하지 않음 — 위험 등급과 잠식률만 저장
    localStorage.setItem(
      `share_${id}`,
      JSON.stringify({ risk_grade: result.risk_grade, burden_ratio: result.burden_ratio, type: 'basic' }),
    );
    const url = `${window.location.origin}/report/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }

  // ── 자동 계산 (디바운스 400ms) ──────────────────────────────
  useEffect(() => {
    if (!inputs.assetValue || !inputs.expectedExtra) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/shock-calc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asset_value: Number(inputs.assetValue),
            expected_extra: Number(inputs.expectedExtra),
            cost_increase_rate: Math.round(inputs.costRate * 100),
            project_stage: 'approval',
          }),
        });

        const data = await res.json();

        if (!data || data.error) {
          console.warn('API 응답 오류:', data);
          return;
        }

        // shock-calc 응답을 UI 필드로 변환
        const RISK_COLORS = { R1: '#16a34a', R2: '#d97706', R3: '#e63946', R4: '#b91c1c' };
        const assetVal = Number(inputs.assetValue);
        const extraVal = Number(inputs.expectedExtra);
        const result = {
          risk_grade:    data.risk_level,
          burden_ratio:  assetVal > 0 ? Math.round((extraVal / assetVal) * 100 * 10) / 10 : 0,
          new_extra:     data.expected_contribution,
          increase_amount: data.expected_contribution - extraVal,
          color:         RISK_COLORS[data.risk_level] ?? '#64748b',
          shock_message: data.shock_message,
        };

        setResult(result);

        if (result.burden_ratio !== undefined) {
          sendGAEvent({
            event: 'member_calc_executed',
            value: result.burden_ratio,
          });
          if (result.burden_ratio >= 40) {
            sendGAEvent({
              event: 'member_high_risk_detected',
              value: result.burden_ratio,
            });
          }
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputs]);

  // ── 위험 메시지 ──────────────────────────────────────────────
  const getRiskMessage = () => {
    const ratio = result?.burden_ratio || 0;
    if (ratio < 20)
      return '현재는 방어 가능하지만, 공사비 5% 추가 상승 시 손익분기점에 도달합니다.';
    if (ratio < 40)
      return '공사비가 한 번 더 오르면 자산 감소 구간에 진입합니다.';
    return '이미 자산 잠식 구간입니다. 다음 총회 전 구조 점검이 필요합니다.';
  };

  // ── 리포트 다운로드 (베타: 이메일 수집) ──────────────────────
  // 🔒 결제 활성화 후: /api/member-report POST → PDF FileResponse 직접 다운로드
  const handlePurchase = async () => {
    if (!result) return;

    // ✅ FIX: inputs.assetValue, inputs.expectedExtra, result.risk_grade 사용
    const email = prompt('리포트를 받을 이메일을 입력해주세요.');
    if (!email) return;

    setLoadingReport(true);

    try {
      await fetch('/api/lead-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          product_type: 'basic',
          asset_value: Number(inputs.assetValue), // ✅ inputs에서 참조
          expected_extra: Number(inputs.expectedExtra), // ✅ inputs에서 참조
          burden_ratio: result.burden_ratio,
          risk_grade: result.risk_grade, // ✅ result에서 참조
        }),
      });

      sendGAEvent({ event: 'basic_lead_submit', value: result.burden_ratio });
      alert(
        '베타 신청이 접수되었습니다. 6/15 정식 오픈 시 리포트를 발송해드립니다.',
      );

      /* 🔥 6/15 이후 주석 해제 — 이메일 수집 대신 직접 PDF 다운로드
      const res = await fetch('/api/member-basic-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_value:    Number(inputs.assetValue),
          expected_extra: Number(inputs.expectedExtra),
          cost:           900,
          location:       '',
          complex_name:   '',
        }),
      });
      if (!res.ok) throw new Error('리포트 생성 실패');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'M-DEENO_기본분담금리포트.pdf';
      a.click();
      URL.revokeObjectURL(url);
      */
    } catch (err) {
      console.error('리포트 요청 실패:', err);
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoadingReport(false);
    }
  };

  // ── Pro 페이지 이동 ───────────────────────────────────────────
  const handleReportClick = () => {
    if (!result) return;
    localStorage.setItem(
      'memberPrefill',
      JSON.stringify({
        assetValue: inputs.assetValue,
        expectedExtra: inputs.expectedExtra,
        burdenRatio: result.burden_ratio,
      }),
    );
    sendGAEvent({ event: 'member_to_pro_click', value: result.burden_ratio });
    router.push('/member/report-premium');
  };

  // ── 프리미엄 베타 신청 ────────────────────────────────────────
  const handlePremiumPurchase = async () => {
    const email = prompt('프리미엄 베타 신청 이메일을 입력하세요.');
    if (!email) return;

    await fetch('/api/lead-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        product_type: 'premium',
        asset_value: Number(inputs.assetValue),
        expected_extra: Number(inputs.expectedExtra),
        risk_grade: result?.risk_grade,
      }),
    });

    sendGAEvent({ event: 'premium_lead_submit', value: result?.burden_ratio });
    alert('베타 신청이 접수되었습니다. 6/15 정식 오픈 시 안내드립니다.');

    /* 🔥 6/15 이후 주석 해제
    const res = await fetch('/api/premium-checkout', { method: 'POST' });
    const data = await res.json();
    window.location.href = data.url;
    */
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>
          공사비 10% 오르면,
          <br />
          <span>당신의 순자산은 줄어듭니다.</span>
        </h1>
        <p>조합 안내 수치가 아닌, <span>내 자산 기준</span>으로 구조를 점검해보세요.</p>
      </div>

      <div className={styles.formBox}>
        <label>내 종전자산 (억원)</label>
        <input
          type="number"
          value={inputs.assetValue}
          onChange={(e) => setInputs({ ...inputs, assetValue: e.target.value })}
          placeholder="예: 숫자를 입력해주세요(단위 : 억원)"
        />

        <label>현재 예상 추가 분담금 (억원)</label>
        <input
          type="number"
          value={inputs.expectedExtra}
          onChange={(e) =>
            setInputs({ ...inputs, expectedExtra: e.target.value })
          }
          placeholder="예: 숫자를 입력해주세요(단위 : 억원)"
        />

        <label>공사비 상승률: {inputs.costRate * 100}%</label>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={inputs.costRate * 100}
          onChange={(e) =>
            setInputs({ ...inputs, costRate: Number(e.target.value) / 100 })
          }
        />
      </div>

      {result && (
        <div className={styles.resultBox}>
          <h2>
            🚨 공사비 {inputs.costRate * 100}% 상승 시,
            <br />
            당신의 순자산이 줄어들기 시작합니다.
          </h2>

          <div className={styles.shockBox}>
            <p>예상 추가 부담</p>
            <h1>{result.burden_ratio}% 자산 잠식</h1>
            <p>
              추가 부담 {(result.increase_amount * 10000).toLocaleString()}만원
            </p>
          </div>

          <div className={styles.resultGrid}>
            <div>
              <span>변경 후 분담금</span>
              <strong>{result.new_extra}억</strong>
            </div>
          </div>

          <p className={styles.risk} style={{ color: result.color }}>
            위험도: {result.risk_grade}
          </p>
          <p className={styles.riskMessage}>{getRiskMessage()}</p>

          {/* R1 */}
          {result.burden_ratio < 20 && (
            <div className={styles.basicBox}>
              <h3>📄 현재는 안정 구간입니다</h3>
              <p>
                하지만 현재 계산은 가정 기반 추정치입니다. 실제 사업 구조 검증이
                필요합니다.
              </p>
              <Link href="/member/report-basic">
                <button className={styles.basicBtn}>
                  구조 검증 리포트 보기 (39,000원) →
                </button>
              </Link>
            </div>
          )}

          {/* R2 */}
          {result.burden_ratio >= 20 && result.burden_ratio < 40 && (
            <>
              <div className={styles.basicBox}>
                <h3>📄 자산 감소 가능성 구간</h3>
                <p>공사비 5%만 더 오르면 손익분기점에 도달할 수 있습니다.</p>
                <Link href="/member/report-basic">
                  <button className={styles.basicBtn}>
                    구조 검증 리포트 보기 (39,000원) →
                  </button>
                </Link>
              </div>
              <div className={styles.softPremium}>
                <p>보다 정밀한 총회 대응 전략이 필요하신가요?</p>
                <Link href="/member/report-premium">
                  <button className={styles.softBtn}>
                    전략 패키지 참고하기 →
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* R3 */}
          {result.burden_ratio >= 40 && result.burden_ratio < 60 && (
            <>
              <div className={styles.premiumBox}>
                <h3>⚠ 고위험 구간 진입</h3>
                <p>총회 전 대응 전략 없이 참석하면 협상력이 없습니다.</p>
                <button
                  className={styles.premiumBtn}
                  onClick={handlePremiumPurchase}
                >
                  총회 대응 전략 패키지 보기 (99,000원 베타) →
                </button>
              </div>
              <div className={styles.basicSub}>
                <Link href="/member/report-basic">
                  기본 구조 검증 리포트 보기 (39,000원)
                </Link>
              </div>
            </>
          )}

          {/* R4 */}
          {result.burden_ratio >= 60 && (
            <div className={styles.urgentBox}>
              <h3>🚨 자산 잠식 심각 구간</h3>
              <p>
                현재 구조는 조합원에게 매우 불리한 상태입니다. 대응 전략 없이
                총회에 참석하는 것은 위험합니다.
              </p>
              <button
                className={styles.urgentBtn}
                onClick={handlePremiumPurchase}
              >
                즉시 대응 전략 확인 (99,000원 베타) →
              </button>
            </div>
          )}

          {/* 자산 잠식 시점 (잠금 상태) */}
          <div className={styles.lockedBox}>
            <h3>🔒 자산 잠식 예상 시점</h3>
            <p>
              다음 총회에서 공사비가 5%만 더 오르면
              <br />
              당신의 순자산은 감소 구간에 진입합니다.
            </p>
            <button
              onClick={handlePurchase}
              className={styles.unlockBtn}
              disabled={loadingReport}
            >
              {loadingReport ? '처리 중...' : '잠식 시점 확인하기 →'}
            </button>
          </div>

          {/* 리포트 CTA */}
          <div className={styles.ctaBox}>
            <h3>📄 내 분담금 방어 전략 리포트</h3>
            <ul className={styles.benefitList}>
              <li>✔ 공사비 5%, 10%, 20% 민감도 표</li>
              <li>✔ 내 자산 잠식 시점 계산</li>
              <li>✔ 총회 질문 리스트 5개 제공</li>
              <li>✔ 조합 대응 체크리스트</li>
            </ul>
            <div className={styles.priceBox}>
              <span className={styles.price}>39,000원</span>
              <span className={styles.badge}>6월 한정 베타 29,000원</span>
            </div>
            <button
              onClick={handlePurchase}
              className={styles.purchaseBtn}
              disabled={loadingReport}
            >
              {loadingReport ? '처리 중...' : '내 자산 방어 전략 확인하기 →'}
            </button>
            <p className={styles.priceNote}>
              6/15 정식 오픈 예정
              <br />
              현재는 베타 신청자에게 개별 안내 후 발송됩니다.
            </p>
          </div>

          {/* Pro 브릿지 */}
          <div className={styles.bridgeBox}>
            <h3>🏗 우리 단지 전체 구조도 확인해보시겠습니까?</h3>
            <p>
              개인 리스크뿐 아니라 단지 전체 사업 안정성 점수도 확인할 수
              있습니다.
            </p>
            <button onClick={handleReportClick} className={styles.proBtn}>
              단지 구조 분석 보기 →
            </button>
          </div>

          {/* Premium 업셀 */}
          <div className={styles.upsellBox}>
            <p className={styles.upsellTitle}>
              전략 분석까지 포함된 Premium 리포트를 확인하세요
            </p>
            <Link href="/member/report-premium" className={styles.upsellBtn}>
              Premium 리포트 보기
            </Link>
          </div>

          {/* 공유 */}
          <div className={styles.shareBox}>
            <p className={styles.shareDesc}>
              이 분석 결과를 다른 조합원과 공유해보세요.
            </p>
            <button className={styles.shareBtn} onClick={handleShare}>
              {shareCopied ? '링크가 복사되었습니다 ✓' : '분석 결과 공유하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
