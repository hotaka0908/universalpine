/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.openai_key, // 正しい環境変数名を参照
  },
  // 静的ファイルの提供設定
  // 既存のHTMLファイルなどの静的ファイルを提供するための設定
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
