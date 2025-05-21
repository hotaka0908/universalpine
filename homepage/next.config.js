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
  // 既存のHTMLファイルなどの静的ファイルを提供するための設定
  async rewrites() {
    return [
      // Next.jsのページコンポーネントを優先するため、ルートパスのリダイレクトを削除
      // {
      //   source: '/',
      //   destination: '/index.html',
      // },
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
