/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

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
