// app/layout.js
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  metadataBase: new URL('https://mdeeno.com'),
  title: 'M-DEENO | 재건축 분담금 리스크 분석',
  description:
    '공사비 상승 시 내 분담금이 얼마나 늘어나는지 30초 만에 분석합니다. 위험 등급 판정, 시나리오 비교, 총회 대응 전략까지.',
  verification: {
    google: 'egpUo4dD8e73c7-Sgf7SNHoeFg6kOsPtJf6JoYGE6pw',
    other: {
      'naver-site-verification': ['905d72e9887519789a9582161fb78f72480e8152'],
    },
  },
  openGraph: {
    title: 'M-DEENO | 재건축 분담금, 실제로 얼마나 늘어날까요?',
    description: '공사비 상승 시 내 분담금 변화를 30초 만에 분석합니다',
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
  twitter: {
    card: 'summary_large_image',
    title: 'M-DEENO | 재건축 분담금, 실제로 얼마나 늘어날까요?',
    description: '공사비 상승 시 내 분담금 변화를 30초 만에 분석합니다',
    images: ['/og-image.png'],
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
