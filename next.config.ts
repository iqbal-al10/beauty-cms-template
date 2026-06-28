import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.up.railway.app',
        pathname: '/**',
      },
      // Tambahkan domain lain sesuai kebutuhan
      // Contoh untuk production:
      // {
      //   protocol: 'https',
      //   hostname: 'yourdomain.com',
      //   pathname: '/**',
      // },
    ],
  },
}

export default nextConfig
