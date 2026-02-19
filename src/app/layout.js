// app/layout.js
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  title: 'M-DEENO | 데이터 기반 프롭테크 플랫폼',
  description:
    '감이나 소문이 아닌, Prop-Logic 알고리즘으로 가장 확실한 부동산 전략을 세우세요.',
  verification: {
    naver:
      '<meta name="naver-site-verification" content="905d72e9887519789a9582161fb78f72480e8152" />',
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
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
    </html>
  );
}
