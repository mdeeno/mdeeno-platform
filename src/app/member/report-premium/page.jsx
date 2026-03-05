'use client';

import { useState } from 'react';
import { downloadPdf } from '@/lib/download-pdf';
import styles from './page.module.css';

const INITIAL_FORM = {
  member_name: '',
  complex_name: '',
  location: '',
  asset_value: '',
  expected_extra: '',
  cost: '900',
};

export default function PremiumReportPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (done) setDone(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setLoading(true);

    const payload = {
      member_name:    form.member_name.trim(),
      complex_name:   form.complex_name.trim(),
      location:       form.location.trim() || '해당 지역',
      asset_value:    Number(form.asset_value),
      expected_extra: Number(form.expected_extra),
      cost:           Number(form.cost) || 900,
    };

    try {
      await downloadPdf(
        '/api/member-premium-report',
        payload,
        'M-DEENO_총회전략패키지.pdf',
      );
      setDone(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    form.asset_value !== '' &&
    Number(form.asset_value) > 0 &&
    form.expected_extra !== '' &&
    Number(form.expected_extra) >= 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>M-DEENO Prop-Logic™</p>
        <h1 className={styles.title}>총회 대응 전략 패키지</h1>
        <p className={styles.subtitle}>
          귀하의 자산 정보를 입력하면 맞춤형 전략 리포트 PDF를 즉시 생성합니다.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* ── 선택 필드 ── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>기본 정보 (선택)</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="member_name">
              성함
            </label>
            <input
              className={styles.input}
              id="member_name"
              name="member_name"
              type="text"
              value={form.member_name}
              onChange={handleChange}
              placeholder="홍길동"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="complex_name">
              단지명
            </label>
            <input
              className={styles.input}
              id="complex_name"
              name="complex_name"
              type="text"
              value={form.complex_name}
              onChange={handleChange}
              placeholder="○○아파트"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="location">
              지역
            </label>
            <input
              className={styles.input}
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="예: 서울 강남구"
            />
          </div>
        </div>

        {/* ── 필수 필드 ── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>자산 정보 (필수)</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="asset_value">
              종전자산 <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                id="asset_value"
                name="asset_value"
                type="number"
                value={form.asset_value}
                onChange={handleChange}
                placeholder="5"
                min="0.1"
                step="0.1"
                required
              />
              <span className={styles.unit}>억원</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="expected_extra">
              예상 추가 분담금 <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                id="expected_extra"
                name="expected_extra"
                type="number"
                value={form.expected_extra}
                onChange={handleChange}
                placeholder="1.2"
                min="0"
                step="0.1"
                required
              />
              <span className={styles.unit}>억원</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cost">
              현재 평당 공사비
            </label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                id="cost"
                name="cost"
                type="number"
                value={form.cost}
                onChange={handleChange}
                placeholder="900"
                min="1"
                step="10"
              />
              <span className={styles.unit}>만원</span>
            </div>
          </div>
        </div>

        {/* ── 에러 메시지 ── */}
        {error && (
          <div className={styles.errorBox}>
            <strong>{error.message ?? 'PDF 생성에 실패했습니다.'}</strong>
            {error.fields && error.fields.length > 0 && (
              <ul className={styles.errorFields}>
                {error.fields.map((f, i) => (
                  <li key={i}>
                    <span className={styles.errorField}>{f.field}</span>: {f.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── 성공 메시지 ── */}
        {done && (
          <div className={styles.successBox}>
            리포트 PDF가 다운로드되었습니다.
          </div>
        )}

        {/* ── 제출 버튼 ── */}
        <button
          className={styles.submitBtn}
          type="submit"
          disabled={loading || !isValid}
        >
          {loading ? (
            <span className={styles.loadingInner}>
              <span className={styles.spinner} />
              리포트 생성 중...
            </span>
          ) : (
            '전략 리포트 PDF 생성하기'
          )}
        </button>

        <p className={styles.notice}>
          * 표시 항목은 필수입니다. 입력 정보는 리포트 생성에만 사용됩니다.
        </p>
      </form>
    </div>
  );
}
