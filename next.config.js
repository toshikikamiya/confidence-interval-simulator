/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML出力用
  basePath: process.env.GITHUB_ACTIONS ? '/confidence-interval-simulator' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
