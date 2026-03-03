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

  useEffect(() => {
    if (!inputs.assetValue || !inputs.expectedExtra) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asset_value: Number(inputs.assetValue),
            expected_extra: Number(inputs.expectedExtra),
            cost_rate: inputs.costRate,
          }),
        });

        const data = await res.json();

        // 🚨 핵심 방어 로직: data가 아예 없거나 백엔드 에러를 뱉으면 화면을 멈추고 크래시 방지
        if (!data || data.error) {
          console.warn('API 응답에 문제가 있습니다:', data);
          return;
        }

        setResult(data);

        // 1️⃣ 계산 실행 이벤트 (데이터가 안전할 때만 GA 전송)
        if (data?.burden_ratio !== undefined) {
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
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
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

    router.push('/enterprise');
  };

  const getRiskMessage = () => {
    // result가 null일 때를 대비한 방어 체인(?.) 추가
    const ratio = result?.burden_ratio || 0;

    if (ratio < 20) {
      return '현재는 방어 가능하지만, 공사비 5% 추가 상승 시 손익분기점에 도달합니다.';
    }
    if (ratio < 40) {
      return '공사비가 한 번 더 오르면 자산 감소 구간에 진입합니다.';
    }
    return '이미 자산 잠식 구간입니다. 다음 총회 전 구조 점검이 필요합니다.';
  };

  const handlePurchase = async () => {
    const email = prompt('리포트를 받을 이메일을 입력해주세요.');
    if (!email) return;

    await fetch('/api/lead-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        product_type: 'basic',
        asset_value,
        expected_extra,
        score,
        risk_grade,
      }),
    });
    // 🔥 6월 15일 이후 활성화
    /*
const handlePayment = async () => {
  const res = await fetch('/api/create-payment', {
    method: 'POST'
  })

  const { url } = await res.json()
  window.location.href = url
}
*/

    const handlePremiumPurchase = async () => {
      // 🔒 6/14까지는 이메일 수집
      await fetch('/api/beta-apply', {
        method: 'POST',
        body: JSON.stringify({
          asset_value: inputs.assetValue,
          expected_extra: inputs.expectedExtra,
          risk: result.risk_grade,
        }),
      });

      alert('베타 신청이 접수되었습니다. 6/15 정식 오픈 시 안내드립니다.');

      /*
  // 6/15 이후 주석 해제
  const res = await fetch('/api/premium-checkout', { method: 'POST' })
  const data = await res.json()
  window.location.href = data.url
  */
    };

    alert('베타 신청이 접수되었습니다.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>
          공사비 10% 오르면,
          <br />
          <span>당신의 순자산은 줄어듭니다.</span>
        </h1>
        <p>조합 안내 수치가 아닌, ‘내 자산 기준’으로 구조를 점검해보세요.</p>
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

          {/* =========================
   📌 단계형 판매 구조
========================= */}

          {/* 🔹 R1 */}
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

          {/* 🔹 R2 */}
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

          {/* 🔹 R3 */}
          {result.burden_ratio >= 40 && result.burden_ratio < 60 && (
            <>
              <div className={styles.premiumBox}>
                <h3>⚠ 고위험 구간 진입</h3>
                <p>총회 전 대응 전략 없이 참석하면 협상력이 없습니다.</p>
                <Link href="/member/report-premium">
                  <button className={styles.premiumBtn}>
                    총회 대응 전략 패키지 보기 (99,000원 베타) →
                  </button>
                </Link>
              </div>

              <div className={styles.basicSub}>
                <Link href="/member/report-basic">
                  기본 구조 검증 리포트 보기 (39,000원)
                </Link>
              </div>
            </>
          )}

          {/* 🔹 R4 */}
          {result.burden_ratio >= 60 && (
            <div className={styles.urgentBox}>
              <h3>🚨 자산 잠식 심각 구간</h3>
              <p>
                현재 구조는 조합원에게 매우 불리한 상태입니다. 대응 전략 없이
                총회에 참석하는 것은 위험합니다.
              </p>
              <Link href="/member/report-premium">
                <button className={styles.urgentBtn}>
                  즉시 대응 전략 확인 (99,000원 베타) →
                </button>
              </Link>
            </div>
          )}

          <div className={styles.lockedBox}>
            <h3>🔒 자산 잠식 예상 시점</h3>
            <p>
              다음 총회에서 공사비가 5%만 더 오르면
              <br />
              당신의 순자산은 감소 구간에 진입합니다.
            </p>
            <button onClick={handlePurchase} className={styles.unlockBtn}>
              잠식 시점 확인하기 →
            </button>
          </div>

          <div className={styles.ctaBox}>
            <h3>📄 내 분담금 방어 전략 리포트</h3>

            <ul className={styles.benefitList}>
              <li>✔ 공사비 5%,10%,20% 민감도 표</li>
              <li>✔ 내 자산 잠식 시점 계산</li>
              <li>✔ 총회 질문 리스트 5개 제공</li>
              <li>✔ 조합 대응 체크리스트</li>
            </ul>

            <div className={styles.priceBox}>
              <span className={styles.price}>39,000원</span>
              <span className={styles.badge}>6월 한정 베타 29,000원</span>
            </div>

            <button onClick={handlePurchase} className={styles.purchaseBtn}>
              내 자산 방어 전략 확인하기 →
            </button>

            <p className={styles.priceNote}>
              6/15 정식 오픈 예정
              <br />
              현재는 베타 신청자에게 개별 안내 후 발송됩니다.
            </p>
          </div>
          <div className={styles.bridgeBox}>
            <h3>🏗 우리 단지 전체 구조도 확인해보시겠습니까?</h3>
            <p>
              개인 리스크뿐 아니라 단지 전체 사업 안정성 점수도 확인할 수
              있습니다.
            </p>
            <button
              onClick={() => {
                sendGAEvent({
                  event: 'member_to_pro_click',
                  value: result.burden_ratio,
                });
                router.push('/enterprise');
              }}
              className={styles.proBtn}
            >
              단지 구조 분석 보기 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
