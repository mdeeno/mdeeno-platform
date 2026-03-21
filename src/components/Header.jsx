'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { TECH_URL } from '@/lib/constants';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (href) => {
    if (href === '/member') return pathname.startsWith('/member');
    if (href === '/reports') return pathname === '/reports';
    return false;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo.png"
            alt="M-DEENO"
            width={154}
            height={24}
            className={styles.logoImg}
            priority
          />
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className={styles.nav}>
          <Link
            href="/member"
            className={`${styles.navItem} ${isActive('/member') ? styles.navActive : ''}`}
          >
            무료 분석
          </Link>
          <Link
            href="/reports"
            className={`${styles.navItem} ${isActive('/reports') ? styles.navActive : ''}`}
          >
            리포트 소개
          </Link>
          <a
            href={TECH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navItem}
          >
            블로그 ↗
          </a>
        </nav>

        {/* 우측 액션 (데스크톱) */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            로그인
          </Link>
          <Link href="/member" className={styles.startBtn}>
            30초 무료 진단 시작
          </Link>
        </div>

        {/* 햄버거 버튼 (모바일 전용) */}
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

      {/* 모바일 전체 메뉴 레이어 */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}
      >
        <nav className={styles.mobileNav}>
          <Link
            href="/member"
            className={isActive('/member') ? styles.mobileActive : ''}
            onClick={toggleMenu}
          >
            무료 분석
          </Link>
          <Link
            href="/reports"
            className={isActive('/reports') ? styles.mobileActive : ''}
            onClick={toggleMenu}
          >
            리포트 소개
          </Link>
          <a href={TECH_URL} target="_blank" rel="noopener noreferrer" onClick={toggleMenu}>
            블로그 ↗
          </a>
          <hr className={styles.divider} />
          <Link href="/login" onClick={toggleMenu}>
            로그인
          </Link>
          <Link
            href="/member"
            className={styles.mobileStartBtn}
            onClick={toggleMenu}
          >
            30초 무료 진단 시작
          </Link>
        </nav>
      </div>
    </header>
  );
}
