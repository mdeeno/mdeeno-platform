'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { sendGAEvent } from '@next/third-parties/google';

export default function PropLogicMvp() {
  // 1. 단계 관리를 위한 state 추가
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false); // 로딩상태

  // 2. 입력 폼 대폭 확장 (기본 + PDF용 추가 정보)
  const [inputs, setInputs] = useState({
    // Step 1 기본 정보
    area: 55000,
    unit: 'py',
    assetValue: 6400,
    cost: 900,
    scenario: 'base',
    // Step 2 추가 정보
    complexName: '', // 단지명
    location: '', // 위치(구)
    households: '', // 세대수
    avgSize: '', // 기존 평균 평형
    salePrice: '', // 일반분양가 가정
    generalRatio: '', // 일반분양 비율
    applicantName: '', // 신청자 이름
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
              // [Data Asset] B2B 데이터 축적을 위해 비식별 정보(지역, 단지명)도 함께 전송
              location: inputs.location,
              complex_name: inputs.complexName,
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

  // 1단계 -> 2단계 이동 시 유효성 검사
  const handleStep1Next = () => {
    if (
      !inputs.area ||
      inputs.area <= 0 ||
      !inputs.assetValue ||
      inputs.assetValue <= 0
    ) {
      alert(
        "정확한 계산을 위해 '건축 연면적'과 '종전자산 평가액'을 입력해 주세요.",
      );
      return;
    }
    setStep(2);
    setTimeout(
      () =>
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        }),
      100,
    );
  };

  // 2단계 -> 3단계 이동 시 유효성 검사
  const handleNextStep = () => {
    if (
      !inputs.complexName ||
      !inputs.location ||
      !inputs.households ||
      !inputs.avgSize
    ) {
      alert('정밀 분석을 위해 필수 정보(*)를 모두 입력해 주세요.');
      return;
    }
    setStep(3);
    setTimeout(
      () =>
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        }),
      100,
    );
  };

  // 리포트 신청 및 다운로드 로직
  // 3단계: 리포트 생성 및 다운로드 API 호출
  // 🚀 3단계: 리포트 신청 (컨시어지 MVP 모드 - 자동 다운로드 임시 주석)
  const handleSubscribe = async () => {
    // 1. 이메일 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return alert('올바른 이메일 주소를 입력해 주세요.');
    }

    setIsGenerating(true); // 버튼 비활성화 & 로딩 시작

    try {
      // 2. Supabase에 리드 저장 (DB 저장은 무조건 실행!)
      const { error: dbError } = await supabase
        .from('expert_requests')
        .insert([{ email, ...inputs, score: result.score }]);
      
      if (dbError) {
        console.error('DB 저장 에러:', dbError);
        throw new Error('데이터베이스 통신 오류');
      }

      // =================================================================
      // 🚨 [추후 복구용 주석] 6월 이후 자동화 / 유료화 시 아래 주석만 해제하세요!
      // =================================================================
      /*
      const areaValue =
        inputs.unit === 'm2' ? (inputs.area * 0.3025).toFixed(2) : inputs.area;
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputs,
          area: areaValue,
          email,
          score: result.score,
          complexName: inputs.complexName,
          avgSize: inputs.avgSize,
          households: inputs.households,
        }),
      });

      if (!response.ok) throw new Error('서버에서 리포트를 만들지 못했습니다.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `M-DEENO_분석리포트_${inputs.complexName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      */
      // =================================================================

      // 구글 애널리틱스 이벤트 전송
      sendGAEvent({ event: 'generate_report', value: 'success' });

      // 3. 유저 안내 메시지 (수동 발송 안내)
      alert(
        '✅ 리포트 신청이 완료되었습니다.\n\nM-DEENO 전문가가 입력하신 데이터를 1차 검증한 후, 24시간 내에 기재해주신 이메일로 분석 리포트(PDF)를 발송해 드립니다.',
      );
      setEmail('');
    } catch (err) {
      console.error('리포트 신청 실패:', err);
      alert('리포트 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false); // 로딩 해제
    }
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

      {/* ========================================================= */}
      {/* [STEP 1] 기본 분석 엔진 (항상 보임) */}
      {/* ========================================================= */}
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
      </div>

      {/* 결과창 (Step 1의 끝) */}
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
        <p>
          <span>{result.description}</span>
        </p>
        <br />
        <p className={styles.detailDescription}>
          * 본 서비스(Prop-Logic)의 분석 결과는 추정치이며, 조합의 공식 결과와
          다를 수 있습니다.
          <br />* 본 자료는 법적 분쟁의 증거로 사용될 수 없으며, 의사결정의
          참고용으로만 활용하시기 바랍니다.
        </p>
        {/* Step 1일 때만 '다음 단계' 버튼 표시 */}
        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p className={styles.ctaWarn} style={{ marginBottom: '15px' }}>
              📌 위 점수는 단순 가정을 통한 ‘판단의 출발점’일 뿐입니다.
            </p>
            <button
              onClick={handleStep1Next}
              className={`${styles.labBtn} ${styles.labBtnCta}`}
            >
              📄 조합 제출용 상세 리포트 신청하기 →
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* [STEP 2] 추가 정보 입력 (Step 2 이상일 때만 렌더링) */}
      {/* ========================================================= */}
      {step >= 2 && (
        <div
          className={styles.labInputGroup}
          style={{ marginTop: '30px', border: '2px solid #1e40af' }}
        >
          <h3
            className={styles.sectionTitle}
            style={{
              margin: '10px 0 20px',
              borderLeft: 'none',
              textAlign: 'center',
            }}
          >
            📝 정밀 분석을 위한 추가 정보
          </h3>
          <p
            className={styles.labSmallText}
            style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#ea580c',
            }}
          >
            * 입력하신 정보는 리포트 생성에만 사용되며 외부에 절대 공개되지
            않습니다.
          </p>

          <div className={styles.labGrid}>
            <div>
              <label className={styles.labLabel}>단지명 *</label>
              <input
                type="text"
                name="complexName"
                value={inputs.complexName || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 마포 래미안 푸르지오"
              />
            </div>
            <div>
              <label className={styles.labLabel}>위치(구/동) *</label>
              <input
                type="text"
                name="location"
                value={inputs.location || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 마포구 아현동"
              />
            </div>
            <div>
              <label className={styles.labLabel}>총 세대수 *</label>
              <input
                type="number"
                name="households"
                value={inputs.households || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 3885"
              />
            </div>
            <div>
              <label className={styles.labLabel}>기존 평균 평형 *</label>
              <input
                type="number"
                name="avgSize"
                value={inputs.avgSize || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 34"
              />
            </div>
            <div>
              <label className={styles.labLabel}>
                일반분양가 예상 (평당 만원)
              </label>
              <input
                type="number"
                name="salePrice"
                value={inputs.salePrice || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 4500 (선택)"
              />
            </div>
            <div>
              <label className={styles.labLabel}>신청자 이름 (선택)</label>
              <input
                type="text"
                name="applicantName"
                value={inputs.applicantName || ''}
                onChange={handleChange}
                className={styles.labInput}
                placeholder="예: 홍길동"
              />
            </div>
          </div>

          {/* Step 2일 때만 '다음 단계' 버튼 표시 */}
          {step === 2 && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                onClick={handleNextStep}
                className={styles.labBtn}
                style={{ background: '#1e40af' }}
              >
                다음 단계로 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* [STEP 3] 이메일 수집 및 최종 신청 (Step 3일 때만 렌더링) */}
      {/* ========================================================= */}
      {step === 3 && (
        <div
          className={styles.leadFormBox}
          style={{ border: '2px solid #f97316' }}
        >
          <h3 className={styles.leadTitle}>
            📩 리포트를 받아보실 이메일을 입력해 주세요
          </h3>
          <p className={styles.leadDesc}>
            실제 조합 및 총회에 제출할 수 있는 수준의 상세 분석 리포트(PDF)가
            발송됩니다.
          </p>

          {/* 링크 및 클릭 유도 UI 적용 */}
          <div className={styles.thumbnailWrapper}>
            <a
              href="/sample-report"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', transition: 'transform 0.2s' }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = 'scale(1.05)')
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div
                className={styles.fakePdf}
                style={{ cursor: 'pointer', border: '2px solid #1e40af' }}
              >
                <div className={styles.fakePdfHeader}></div>
                <div className={styles.fakePdfBody}></div>
                <div className={styles.fakePdfBodyShort}></div>
                {/* 클릭 유도 텍스트로 변경 */}
                <p
                  className={styles.fakePdfText}
                  style={{ fontSize: '0.8rem' }}
                >
                  🔍 리포트 샘플 보기
                </p>
              </div>
            </a>
          </div>
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#1e40af',
              marginTop: '-20px',
              marginBottom: '20px',
              fontWeight: '700',
            }}
          >
            👆 이미지를 클릭하면 샘플을 볼 수 있습니다.
          </p>

          <div className={styles.emailForm}>
            <input
              type="email"
              placeholder="결과를 받으실 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              disabled={isGenerating}
            />

            {/* =================================================================
                🚨 [추후 복구용 주석] 6월 이후 자동화 시 아래 텍스트로 원복하세요!
                {isGenerating ? 'PDF 굽는 중... ⏳' : '리포트 즉시 다운로드'}
                ================================================================= */}
            <button
              onClick={handleSubscribe}
              className={styles.emailBtn}
              style={{
                background: isGenerating ? '#94a3b8' : '#f97316',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
              }}
              disabled={isGenerating}
            >
              {isGenerating ? '신청 접수 중... ⏳' : '전문가 검증 리포트 신청'}
            </button>
          </div>
          <p
            className={styles.helperText}
            style={{ marginTop: '20px', fontSize: '0.85rem' }}
          >
            (현재 베타 기간 한정 <strong>무료</strong> 제공 중입니다. 추후
            39,000원에 유료 전환될 예정입니다.)
          </p>
        </div>
      )}
    </div>
  );
}
