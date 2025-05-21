/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
      }
    ];
  },
};

module.exports = nextConfig;
