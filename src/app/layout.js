// app/layout.js
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  metadataBase: new URL('https://mdeeno.com'),
  title: 'M-DEENO Prop-Logic™ | 정비사업 리스크 데이터 플랫폼',
  description:
    '공사비 변화에 따른 정비사업 사업안전도를 구조적으로 분석합니다. Prop-Logic™ 엔진 기반 실시간 시뮬레이션 및 조합 제출용 분석 리포트 제공.',
  verification: {
    other: {
      'naver-site-verification': ['905d72e9887519789a9582161fb78f72480e8152'],
    },
  },
  openGraph: {
    title: 'M-DEENO Prop-Logic | Master Digital Economic Innovation',
    description: '실시간 공사비 시뮬레이션으로 확인하는 우리 단지 사업 안정성',
    url: 'https://mdeeno.com',
    siteName: 'M-DEENO',
    images: [
      {
        url: '/og-image.png', // public 폴더에 대표 이미지를 넣어주시면 좋습니다.
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
