/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/confidence-interval-simulator',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: '/confidence-interval-simulator/',
}

module.exports = nextConfig
