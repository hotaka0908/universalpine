/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // TypeScriptのエラーをビルド時に警告として扱う
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLintのエラーをビルド時に警告として扱う
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 静的ファイルの提供設定
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
