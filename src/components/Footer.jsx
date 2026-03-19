import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h2 className={styles.logo}>M-DEENO</h2>
          <p className={styles.desc}>재건축·재개발 분담금 분석 서비스</p>
        </div>
        <div className={styles.links}>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <a href="mailto:mdeeno.official@gmail.com">문의하기</a>
        </div>
      </div>
      <p className={styles.disclaimer}>
        본 분석은 입력값 기반 시뮬레이션 결과이며, 법적 효력이 없습니다. 투자 판단의 근거로 사용할 수 없습니다.
      </p>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} M-DEENO. All rights reserved.
      </div>
    </footer>
  );
}
