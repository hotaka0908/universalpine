/** @type {import('next').NextConfig} */
const nextConfig = {
  // 環境変数の設定
  env: {
    // Vercelダッシュボードで設定した環境変数を参照
    openai_key: process.env.openai_key,
  },
  // CORS設定を有効にする
  async headers() {
    return [
      {
        // すべてのAPIルートに適用
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  // 出力ディレクトリの設定
  distDir: '.next',
};

module.exports = nextConfig;
