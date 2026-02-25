'use client'; // 상태 관리를 위해 클라이언트 컴포넌트로 선언

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { TECH_URL } from '@/lib/constants';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          M-DEENO
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className={styles.nav}>
          <nav className={styles.nav}>
            <Link href="/calc-member" className={styles.navLink}>
              조합원 분담금 계산
            </Link>

            <Link href="/mvp" className={styles.navLink}>
              조합장 사업성 분석
            </Link>
          </nav>
          <a
            href={TECH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            전문가 부동산 리포트 ↗
          </a>
        </nav>

        {/* 우측 액션 (데스크톱) */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            로그인
          </Link>
          <Link href="/mvp" className={styles.startBtn}>
            무료로 시작하기
          </Link>
        </div>

        {/* 🍔 햄버거 버튼 (모바일 전용) */}
        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="메뉴 열기"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>

      {/* 📱 모바일 전체 메뉴 레이어 */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}
      >
        <nav className={styles.mobileNav}>
          <nav className={styles.nav}>
            <Link href="/calc-member" className={styles.navLink}>
              조합원 분담금 계산
            </Link>

            <Link href="/mvp" className={styles.navLink}>
              조합장 사업성 분석
            </Link>
          </nav>
          <a href={TECH_URL} onClick={toggleMenu}>
            전문가 부동산 리포트 ↗
          </a>
          <hr className={styles.divider} />
          <Link href="/login" onClick={toggleMenu}>
            로그인
          </Link>
          <Link
            href="/mvp"
            className={styles.mobileStartBtn}
            onClick={toggleMenu}
          >
            무료로 시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
