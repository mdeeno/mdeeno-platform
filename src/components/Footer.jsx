import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h2 className={styles.logo}>M-DEENO</h2>
          <p className={styles.desc}>데이터 기반 프롭테크 플랫폼</p>
        </div>
        <div className={styles.links}>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} M-DEENO. All rights reserved.
      </div>
    </footer>
  );
}
