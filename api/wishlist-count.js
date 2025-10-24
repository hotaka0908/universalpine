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

// レート制限チェック
async function checkRateLimit(identifier) {
  const RATE_LIMIT_KEY = `ratelimit:wishlist:${identifier}`;
  const MAX_REQUESTS = 10; // 10回まで
  const WINDOW_SECONDS = 60; // 60秒間

  try {
    const requests = await kv.incr(RATE_LIMIT_KEY);

    // 初回リクエスト時に有効期限を設定
    if (requests === 1) {
      await kv.expire(RATE_LIMIT_KEY, WINDOW_SECONDS);
    }

    return requests <= MAX_REQUESTS;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // エラー時は通過させる（可用性優先）
    return true;
  }
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
      // レート制限チェック（IPアドレスベース）
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'unknown';
      const isAllowed = await checkRateLimit(clientIp);

      if (!isAllowed) {
        return sendErrorResponse(res, 429, 'Too many requests', 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。');
      }

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
