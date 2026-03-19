/** @type {import('next').NextConfig} */

// ── CSP (Content Security Policy) ─────────────────────────────────────────────
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com;
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

// ── 보안 헤더 목록 ────────────────────────────────────────────────────────────
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  /* config options here */
  reactCompiler: true,

  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/calc-member',
        destination: '/member',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/member/report-basic',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
