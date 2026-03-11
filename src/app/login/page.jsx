import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: '로그인 준비 중 | M-DEENO',
  robots: { index: false },
};

export default function LoginComingSoonPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>M-DEENO</p>
        <h1 className={styles.title}>로그인 기능 준비 중</h1>
        <p className={styles.desc}>
          회원 기능은 현재 개발 중입니다.<br />
          지금은 로그인 없이도 분담금 분석을 이용하실 수 있습니다.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          분담금 분석 시작하기 →
        </Link>
        <Link href="/" className={styles.backLink}>
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
