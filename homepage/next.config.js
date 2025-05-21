/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 正しい環境変数名を参照する
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // API Routesの設定
  api: {
    // API Routesのレスポンスサイズ制限を増やす
    bodyParser: {
      sizeLimit: '4mb', // 音声データなどの大きなファイルを扱うため
    },
    // CORS設定
    externalResolver: true,
  },
  // 静的ファイルの提供設定
  // HTMLファイルがルートディレクトリに移動されたため、それらを提供するための設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600', // 1時間のキャッシュ
          },
        ],
      },
    ];
  },
  // ルートディレクトリのHTMLファイルを提供するための設定
  async rewrites() {
    return [
      // index.jsxを優先するため、ルートパスはリダイレクトしない
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
