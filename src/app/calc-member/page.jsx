'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { sendGAEvent } from '@next/third-parties/google';
import { useRouter } from 'next/navigation';

export default function MemberCalc() {
  const router = useRouter();

  const [inputs, setInputs] = useState({
    assetValue: '',
    expectedExtra: '',
    costRate: 0.1,
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!inputs.assetValue || !inputs.expectedExtra) return;

    const timer = setTimeout(async () => {
      const res = await fetch('/api/calc-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_value: Number(inputs.assetValue),
          expected_extra: Number(inputs.expectedExtra),
          cost_rate: inputs.costRate,
        }),
      });

      const data = await res.json();
      setResult(data);

      // 1️⃣ 계산 실행 이벤트
      sendGAEvent({
        event: 'member_calc_executed',
        value: data.burden_ratio,
      });

      // 2️⃣ 고위험 탐지 이벤트
      if (data.burden_ratio >= 40) {
        sendGAEvent({
          event: 'member_high_risk_detected',
          value: data.burden_ratio,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputs]);

  const handleReportClick = () => {
    if (!result) return;

    // 3️⃣ Pro로 데이터 넘기기
    localStorage.setItem(
      'memberPrefill',
      JSON.stringify({
        assetValue: inputs.assetValue,
        expectedExtra: inputs.expectedExtra,
        burdenRatio: result.burden_ratio,
      }),
    );

    sendGAEvent({
      event: 'member_to_pro_click',
      value: result.burden_ratio,
    });

    router.push('/mvp');
  };

  const getRiskMessage = () => {
    if (!result) return '';
    if (result.burden_ratio < 20) return '아직 방어 가능 구간입니다.';
    if (result.burden_ratio < 40)
      return '공사비 추가 인상 시 리스크 확대 구간입니다.';
    return '자산 잠식 구간. 구조 점검이 필요합니다.';
  };

  const handlePurchase = async () => {
    if (!result) return;

    const res = await fetch('/api/member-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_value: inputs.assetValue,
        expected_extra: inputs.expectedExtra,
        cost_rate: inputs.costRate,
      }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `M-DEENO_개인리포트.pdf`;
    a.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>
          공사비 10% 오르면,
          <br />
          <span>내 분담금은 얼마나 늘어날까?</span>
        </h1>
        <p>조합이 말하지 않는 ‘내 돈’ 기준으로 계산해보세요.</p>
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
            setInputs({
              ...inputs,
              costRate: Number(e.target.value) / 100,
            })
          }
          placeholder="예: 숫자를 입력해주세요(단위 : %)"
        />
      </div>

      {result && (
        <div className={styles.resultBox}>
          <h2>📊 예상 결과</h2>

          <div className={styles.resultGrid}>
            <div>
              <span>변경 후 분담금</span>
              <strong>{result.new_extra}억</strong>
            </div>
            <div>
              <span>추가 부담</span>
              <strong>
                {(result.increase_amount * 10000).toLocaleString()}만원
              </strong>
            </div>
            <div>
              <span>자산 대비 부담률</span>
              <strong>{result.burden_ratio}%</strong>
            </div>
          </div>

          <p className={styles.risk} style={{ color: result.color }}>
            위험도: {result.risk_level}
          </p>

          <p className={styles.riskMessage}>{getRiskMessage()}</p>

          <div className={styles.ctaBox}>
            <div className={styles.ctaBox}>
              <h3>📄 내 분담금 방어 전략 리포트</h3>

              <ul className={styles.benefitList}>
                <li>✔ 공사비 5%,10%,20% 민감도 표</li>
                <li>✔ 내 자산 잠식 시점 계산</li>
                <li>✔ 총회 질문 리스트 5개 제공</li>
                <li>✔ 조합 대응 체크리스트</li>
              </ul>

              <div className={styles.priceBox}>
                <span className={styles.price}>29,000원</span>
                <span className={styles.badge}>베타 한정 19,000원</span>
              </div>

              <button onClick={handlePurchase} className={styles.purchaseBtn}>
                지금 내 리포트 받기 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
