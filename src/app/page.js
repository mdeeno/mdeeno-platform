import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* 1. 히어로(메인) 섹션 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            정비사업(재건축, 재개발),
            <br />
            <span className={styles.highlight}>
              감이 아니라 구조로 판단하십시오.
            </span>
          </h1>
          <p className={styles.subtitle}>
            Prop-Logic™ 엔진은 공사비 변화에 따른 사업 안전도를 수치화합니다.
            <br />
            조합원 진단부터 조합·시행사 사업성 분석까지, 데이터 기반 구조 검증을
            제공합니다.
          </p>
          <div className={styles.btnGroup}>
            <div className={styles.btnGroup}>
              <Link href="/calc-member" className={styles.primaryBtn}>
                📊 내 단지 리스크 진단하기
              </Link>

              <Link href="/calc-pro" className={styles.secondaryBtn}>
                🏗 사업 구조 정밀 분석
              </Link>
            </div>
            <a href="/sample-report" className={styles.secondaryBtn}>
              📄 리포트 샘플 보기
            </a>
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능(Feature) 섹션 */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>M-DEENO의 핵심 솔루션</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📉</div>
              <h3 className={styles.cardTitle}>위험의 시각화</h3>
              <p className="text-muted">
                공사비 100만원 인상? 비례율 영향 미미함
                <br />
                👉 <strong>실제 분석: 평균 4,500만원 추가 분담금 발생</strong>
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📊</div>
              <h3 className={styles.cardTitle}>민감도 시나리오 표</h3>
              <p className="text-muted">
                공사비가 5%, 10%, 20% 올랐을 때 내 지분과 분담금이 어떻게
                박살나는지 직관적인 표와 그래프로 확인하세요.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📑</div>
              <h3 className={styles.cardTitle}>조합 제출용 리포트</h3>
              <p className="text-muted">
                단순 계산기가 아닙니다.
                <br />
                도시계획전문가(실무 10년, 도시공학석사)가 설계한{' '}
                <strong>논리적인 해석 문장</strong>을 PDF로 자동 생성해
                드립니다.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.comment}>
          <p>
            * 본 서비스(Prop-Logic)의 분석 결과는 추정치이며, 조합의 공식 결과와
            다를 수 있습니다.
            <br />* 본 자료는 법적 분쟁의 증거로 사용될 수 없으며, 의사결정의
            참고용으로만 활용하시기 바랍니다.
          </p>
        </div>
      </section>
    </div>
  );
}
