'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { sendGAEvent } from '@next/third-parties/google';

export default function PropLogicMvp() {
  const [inputs, setInputs] = useState({
    area: 5000,
    unit: 'py',
    assetValue: 250,
    cost: 900,
    scenario: 'base',
  });
  const [result, setResult] = useState({
    score: '0.00',
    color: '#1e40af',
    status: '데이터 분석 대기 중...',
    description: '',
    cta_text: '점수 기준으로 전문가 검증하기',
  });
  const [email, setEmail] = useState('');

  // 기존 calculate와 useEffect를 하나로 합친 깔끔한 구조
  useEffect(() => {
    // 디바운싱 적용: 사용자가 입력을 멈춘 후 500ms 뒤에 API 호출
    const timer = setTimeout(() => {
      const fetchCalc = async () => {
        try {
          const areaValue =
            inputs.unit === 'm2'
              ? (inputs.area * 0.3025).toFixed(2)
              : inputs.area;

          const response = await fetch('/api/calc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              area: areaValue,
              asset_value: inputs.assetValue,
              cost: inputs.cost,
              scenario: inputs.scenario,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            setResult(data);
          }
        } catch (error) {
          console.error('계산 에러:', error);
        }
      };

      fetchCalc();
    }, 500);

    // cleanup 함수: inputs가 변경되면 이전 타이머를 취소
    return () => clearTimeout(timer);
  }, [inputs]); // inputs가 바뀔 때만 안전하게 실행됨

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === 'cost' ? Number(value) : value,
    }));
  };

  const handleSubscribe = async () => {
    if (!email) {
      return alert('이메일을 입력해 주세요.');
    }
    const { error } = await supabase
      .from('expert_requests')
      .insert([{ email, ...inputs, score: result.score }]);
    if (error) {
      alert('오류: ' + error.message);
    } else {
      sendGAEvent({ event: 'generate_lead', value: 'expert_report_request' });
      alert('신청 완료! 전문가 리포트를 곧 보내드립니다.');
      setEmail('');
    }
  };

  const generateMailLink = (type = 'soft') => {
    const level = type === 'hard' ? '정밀 검증 요청' : '1차 구조 검토 요청';
    const body = encodeURIComponent(
      `[요청 유형] ${level}\n안정성 점수: ${result.score}점\n현재 설정 기준으로 분석을 요청합니다.`,
    );
    window.location.href = `mailto:mdeeno.official@gmail.com?subject=[Prop-Logic 분석]&body=${body}`;
  };

  return (
    <div className={styles.labContainer}>
      {/* 1. 실험실 헤더 */}
      <div className={styles.labFormulaBox}>
        <h2 className={styles.colorBlue}>💻 Prop-Logic Laboratory</h2>
        <p className={styles.labP1}>
          공사비 변화에 따른 사업 안정성 체험 시뮬레이터
        </p>
        <p className={styles.labP3}>
          도시공학 및 정비사업 사업성 검토에서 실제 사용되는 수익·비용 구조를
          기반으로 설계되었습니다.
        </p>
      </div>

      {/* 2. 시뮬레이터 개요 */}
      <div className={styles.introSection}>
        <h3 className={styles.sectionTitle}>🧪 시뮬레이터 개요 및 목적</h3>
        <p className={styles.labText}>
          본 시뮬레이터는 <strong>&apos;공사비 변화&apos;</strong>가{' '}
          <strong>&apos;조합원 분담금&apos;</strong>에{' '}
          <strong>&apos;어떤 영향&apos;</strong>을 주는지를 한눈에 체감할 수
          있도록 설계되었습니다.
        </p>
        <p className={styles.labText}>
          <strong>&apos;실제 정비사업 실무&apos;</strong>에서 사용되는{' '}
          <strong>&apos;사업성 검토 구조&apos;</strong>를 바탕으로 핵심 가정만
          단순화해 반영했습니다.
        </p>
        <p className={styles.labSmallText} style={{ marginTop: '15px' }}>
          ※ 현재 평균 기준(Base 시나리오): 서울 외곽 및 수도권 주요 주거지의
          일반적인 재건축 사업 구조 기준
        </p>
      </div>

      {/* 3. 수식 박스 */}
      <div className={styles.labFormulaBox}>
        <h2 className={styles.formulaTitle}>
          Prop-Logic:
          <br /> 우리 단지 사업안전도 분석기
        </h2>
        <div className={styles.labFormulaText}>
          점수(R) = (분양수익 - 총공사비) / 종전자산가치 × 100
        </div>
        <p className={styles.labFormulaCaption}>
          * <strong>점수(R)가 100 미만</strong>으로 떨어지면 내가 내야 할
          돈(추가 분담금)이 생길 가능성이 커집니다.
        </p>
      </div>

      {/* 4. 엔진 컨테이너 */}
      <div className={styles.labEngineContainer}>
        <h3 className={styles.engineTitle}>📊 실시간 구조 분석 엔진 v1.1</h3>

        <div className={styles.labInputGroup}>
          <p className={styles.stepLabel}>1️⃣ 우리 단지 정보 입력</p>
          <div className={styles.labGrid}>
            <div>
              <label htmlFor="areaInput" className={styles.labLabel}>
                건축 연면적
              </label>
              <div className={styles.flexBox}>
                <input
                  id="areaInput"
                  type="number"
                  name="area"
                  value={inputs.area}
                  onChange={handleChange}
                  className={styles.labInput}
                  style={{ flex: 1 }}
                />
                <select
                  name="unit"
                  value={inputs.unit}
                  onChange={handleChange}
                  className={styles.labInput}
                  style={{ width: '80px' }}
                >
                  <option value="py">평</option>
                  <option value="m2">㎡</option>
                </select>
              </div>
              <p className={styles.helperText}>
                * 지상층 + 지하층 합계 총 연면적 기준
              </p>
            </div>
            <div>
              <label htmlFor="assetValueInput" className={styles.labLabel}>
                종전자산 평가액 (억원)
              </label>
              <input
                id="assetValueInput"
                type="number"
                name="assetValue"
                value={inputs.assetValue}
                onChange={handleChange}
                className={styles.labInput}
              />
              <p className={styles.helperText}>
                * 가치(종전자산): 현재 단지 내 땅과 건물의 전체 평가액
              </p>
            </div>
          </div>

          <div className={styles.scenarioGuide}>
            <p className={styles.labSmallText}>
              💡 <strong>입력 팁:</strong> 단지 정보를 잘 모르신다면? <br />-
              네이버 부동산 <strong>&apos;단지정보&apos;</strong> 탭의 면적별
              정보 확인 <br />- 종전자산 평가는 현재 KB시세의 80~90% 수준으로
              가입력
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.costHeader}>
            <label htmlFor="costInput" className={styles.stepLabel}>
              2️⃣ 평당 공사비 설정 (만원)
            </label>
            <input
              id="costInput"
              type="number"
              name="cost"
              value={inputs.cost}
              onChange={handleChange}
              className={styles.costNumber}
            />
          </div>
          <input
            aria-label="평당 공사비 조절 슬라이더"
            type="range"
            name="cost"
            min="500"
            max="1500"
            step="10"
            value={inputs.cost}
            onChange={handleChange}
            className={styles.costSlider}
          />
        </div>
      </div>

      {/* 5. 시나리오 선택 */}
      <div className={`${styles.labInputGroup} ${styles.scenarioCard}`}>
        <p className={styles.subtleLabel}>📍 시장 환경 시나리오 (가정 비교)</p>
        <div className={styles.scenarioGrid3}>
          {['base', 'stress', 'high'].map((scen) => (
            <label
              key={scen}
              className={`${styles.scenarioOption} ${inputs.scenario === scen ? styles.activeScenario : ''}`}
            >
              <input
                type="radio"
                name="scenario"
                value={scen}
                checked={inputs.scenario === scen}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <span>
                {scen === 'base'
                  ? '현재 평균 기준'
                  : scen === 'stress'
                    ? '최악의 상황 가정'
                    : '분양가 최고 구간'}
              </span>
            </label>
          ))}
        </div>
        <div className={styles.scenarioGuideBox}>
          <ul
            className={styles.labSmallText}
            style={{ paddingLeft: '20px', marginBottom: '10px' }}
          >
            <li>
              <strong>현재 평균</strong> · 수도권 일반적 사업 구조
            </li>
            <li>
              <strong>최악 가정</strong> · 금리·공사비 리스크 동시 발생
            </li>
            <li>
              <strong>최고 구간</strong> · 고분양가 + 고사양 리스크 동반 상승
            </li>
          </ul>
        </div>
      </div>

      {/* 6. 결과창 */}
      <div
        className={`${styles.labFormulaBox} ${styles.labResultFocus}`}
        style={{ borderTop: `5px solid ${result.color}` }}
      >
        <p className={styles.resultSubtitle}>📊 사업 안정성 점수</p>
        <div className={styles.labScoreDisplay} style={{ color: result.color }}>
          {result.score}
          <span className={styles.scoreUnit}> 점</span>
        </div>
        <p className={styles.statusMessage} style={{ color: result.color }}>
          {result.status}
        </p>
        <p className={styles.detailDescription}>{result.description}</p>
      </div>

      {/* 7. 리드 수집 폼 & CTA */}
      <div className={styles.leadFormBox}>
        <h3 className={styles.leadTitle}>✉️ 전문가 정밀 검증 리포트 신청</h3>
        <p className={styles.leadDesc}>
          입력하신 {inputs.area}평 단지 기준으로 정밀 시뮬레이션을 진행해
          드립니다.
        </p>
        <div className={styles.emailForm}>
          <input
            type="email"
            placeholder="결과를 받으실 이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
          />
          <button onClick={handleSubscribe} className={styles.emailBtn}>
            무료 신청하기
          </button>
        </div>
      </div>

      <div className={styles.labCtaSection}>
        <p className={styles.ctaWarn}>
          📌 이 점수는 ‘판단의 출발점’일 뿐입니다.
        </p>
        <p className={styles.labSmallText}>
          * 실제 단지 여건에 따라 결과는 크게 달라질 수 있습니다.
        </p>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => generateMailLink('hard')}
            className={`${styles.labBtn} ${styles.labBtnCta}`}
          >
            {result.cta_text || '점수 기준으로 전문가 검증하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
