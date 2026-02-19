import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* 1. 히어로(메인) 섹션 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            데이터로 증명하는 <br />
            <span className={styles.highlight}>가장 확실한 부동산 전략</span>
          </h1>
          <p className={styles.subtitle}>
            감이나 소문이 아닌, M-DEENO의 Prop-Logic™ 알고리즘으로
            <br />
            재건축 분담금과 투자 가치를 3초 만에 정밀하게 분석하세요.
          </p>
          <div className={styles.btnGroup}>
            <Link href="/mvp" className={styles.primaryBtn}>
              공사비 분담금 진단하기
            </Link>
            <a href="https://tech.mdeeno.com" className={styles.secondaryBtn}>
              전문가 리포트 보기
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
              <div className={styles.iconWrapper}>🏢</div>
              <h3 className={styles.cardTitle}>재건축 리스크 진단</h3>
              <p className="text-muted">
                공사비 인상, 금리 변화에 따른 우리 단지의 예상 추가 분담금을
                시뮬레이션합니다.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>📊</div>
              <h3 className={styles.cardTitle}>AI 기반 시세 전망</h3>
              <p className="text-muted">
                수만 건의 실거래 데이터를 분석하여 향후 매매가 및 전세가
                방어력을 예측합니다.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>💡</div>
              <h3 className={styles.cardTitle}>의사결정 보조 (출시 예정)</h3>
              <p className="text-muted">
                조합원 동의율 및 의사결정을 돕는 데이터 시각화 툴을 준비
                중입니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
