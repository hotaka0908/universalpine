const { createClient } = require('@vercel/kv');

// KV client with custom prefix support
const kv = createClient({
  url: process.env.kv_KV_REST_API_URL || process.env.KV_REST_API_URL,
  token: process.env.kv_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN,
});

// CORS設定
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// OPTIONSリクエストの処理
function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  return false;
}

// エラーレスポンス
function sendErrorResponse(res, statusCode, error, message) {
  return res.status(statusCode).json({
    error: error,
    message: message
  });
}

// 成功レスポンス
function sendSuccessResponse(res, count) {
  return res.status(200).json({
    success: true,
    count: count
  });
}

module.exports = async function handler(req, res) {
  // CORS設定
  setCorsHeaders(res);

  // OPTIONSリクエストの処理
  if (handleOptions(req, res)) return;

  const WISHLIST_KEY = 'product:wishlist:count';

  try {
    // GETリクエスト: カウント取得
    if (req.method === 'GET') {
      const count = await kv.get(WISHLIST_KEY) || 0;
      return sendSuccessResponse(res, count);
    }

    // POSTリクエスト: カウント増加
    if (req.method === 'POST') {
      const newCount = await kv.incr(WISHLIST_KEY);
      return sendSuccessResponse(res, newCount);
    }

    // 許可されていないメソッド
    return sendErrorResponse(res, 405, 'Method not allowed', 'このエンドポイントはGETまたはPOSTメソッドのみサポートしています。');

  } catch (error) {
    console.error('Wishlist count error:', error);
    return sendErrorResponse(res, 500, 'Internal server error', 'カウントの処理中にエラーが発生しました。');
  }
};
