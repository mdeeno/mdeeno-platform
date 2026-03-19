import ReportSamplesSection from '@/app/ReportSamplesSection';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: '리포트 소개 | M-DEENO',
  description:
    '재건축 분담금 리스크 분석 리포트의 구성과 샘플을 확인하세요. 기본 리포트부터 프리미엄 전략 리포트까지.',
};

export default function ReportsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.heroBar}>
        <p className={styles.eyebrow}>M-DEENO</p>
        <h1 className={styles.title}>리포트 소개</h1>
        <p className={styles.desc}>
          내 분담금이 얼마나 위험한지 수치로 확인하고<br />
          총회 당일 쓸 수 있는 대응 전략까지 담았습니다.
        </p>
        <Link href="/member" className={styles.ctaBtn}>
          무료 계산기로 먼저 분석하기 →
        </Link>
      </div>

      <ReportSamplesSection />
    </div>
  );
}
