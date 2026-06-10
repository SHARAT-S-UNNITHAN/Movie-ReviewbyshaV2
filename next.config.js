/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true,
  basePath: '/Movie-ReviewbyshaV2',
  assetPrefix: '/Movie-ReviewbyshaV2',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/Movie-ReviewbyshaV2',
  },
}

module.exports = nextConfig