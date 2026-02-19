// app/layout.js
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'M-DEENO | 데이터 기반 프롭테크 플랫폼',
  description:
    '감이나 소문이 아닌, Prop-Logic 알고리즘으로 가장 확실한 부동산 전략을 세우세요.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
