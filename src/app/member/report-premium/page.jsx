'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);

  const handleBetaRequest = async () => {
    const email = prompt('베타 신청 이메일을 입력하세요.');
    if (!email) return;

    setLoading(true);

    await fetch('/api/lead-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        product_type: 'premium',
      }),
    });

    alert('베타 신청 완료. 6/15 정식 오픈 시 안내드립니다.');
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      {/* 1️⃣ Shock Section */}
      <section className={styles.shock}>
        <h1>
          총회는 감정이 아니라
          <br />
          <span>숫자로 싸우는 자리입니다.</span>
        </h1>
        <p>
          공사비 인상은 협상입니다.
          <br />
          준비하지 않으면 불리합니다.
        </p>
      </section>

      {/* 2️⃣ 손실 강조 */}
      <section className={styles.damage}>
        <h2>조합원 평균 추가 부담</h2>
        <div className={styles.damageBox}>5,000만 ~ 1억 이상</div>
        <p>전략 준비 비용: 99,000원 (베타가)</p>
      </section>

      {/* 3️⃣ 문제 제기 */}
      <section className={styles.problem}>
        <h3>이런 상황이 반복됩니다</h3>
        <ul>
          <li>✔ 공사비 인상 근거를 이해 못함</li>
          <li>✔ 총회에서 질문 못함</li>
          <li>✔ 분위기에 휩쓸려 찬성</li>
          <li>✔ 나중에 분담금 폭탄 체감</li>
        </ul>
      </section>

      {/* 4️⃣ 해결책 */}
      <section className={styles.solution}>
        <h3>총회 대응 전략 패키지</h3>
        <p>감정이 아니라 구조로 대응하십시오.</p>
      </section>

      {/* 5️⃣ 구성 */}
      <section className={styles.contents}>
        <ul>
          <li>1️⃣ 사업 구조 재해석</li>
          <li>2️⃣ 일반분양가 vs 공사비 역산 분석</li>
          <li>3️⃣ 타 단지 비교 지표</li>
          <li>4️⃣ 총회 발언 스크립트</li>
          <li>5️⃣ 공사비 적정성 분석</li>
          <li>6️⃣ 협상 포인트 제안</li>
          <li>7️⃣ 3단계 리스크 대응 시나리오</li>
        </ul>
      </section>

      <section className={styles.compare}>
        <h2>기본 vs 전략 패키지 비교</h2>

        <table>
          <thead>
            <tr>
              <th>항목</th>
              <th>기본 (39,000)</th>
              <th>전략 (149,000)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>구조 검증</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>공사비 역산 분석</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>총회 발언 스크립트</td>
              <td>-</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>협상 전략</td>
              <td>-</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>리스크 대응 시나리오</td>
              <td>-</td>
              <td>✔</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6️⃣ 가격 앵커링 */}
      <section className={styles.pricing}>
        <p className={styles.original}>정식가 149,000원</p>
        <p className={styles.beta}>6월 베타가 99,000원</p>
        <p className={styles.note}>6/15 정식 오픈 후 가격 인상</p>
      </section>

      {/* 7️⃣ CTA */}
      <section className={styles.cta}>
        <button onClick={handleBetaRequest} disabled={loading}>
          {loading ? '신청 접수 중...' : '베타 신청하기'}
        </button>
      </section>
    </div>
  );
}
