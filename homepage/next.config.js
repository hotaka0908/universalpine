/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 正しい環境変数名を参照する
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // 静的ファイルの提供設定
  async rewrites() {
    return [
      // ルートパスの設定 - ルートディレクトリの index.html を表示する
      {
        source: '/',
        destination: '/index.html',
      },
      // その他のHTMLファイルへのアクセスを可能にする
      {
        source: '/about',
        destination: '/about.html',
      },
      {
        source: '/apply',
        destination: '/apply.html',
      },
      {
        source: '/contact',
        destination: '/contact.html',
      },
      {
        source: '/news',
        destination: '/news.html',
      },
      {
        source: '/product',
        destination: '/product.html',
      },
      {
        source: '/project',
        destination: '/project.html',
      },
      {
        source: '/recruit',
        destination: '/recruit.html',
      },
      {
        source: '/thanks',
        destination: '/thanks.html',
      },
      {
        source: '/voice-chat-test',
        destination: '/voice-chat-test.html',
      },
      {
        source: '/voice-chat-redirect',
        destination: '/voice-chat-redirect.html',
      },
    ];
  },
};

module.exports = nextConfig;
