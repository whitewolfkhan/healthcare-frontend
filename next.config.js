/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;
