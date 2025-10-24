/**
 * Common helper functions for API routes
 */

// HTML escape function to prevent XSS
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CORS設定
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

// メソッドバリデーション
function validateMethod(req, res, allowedMethods = ['POST']) {
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: 'Method not allowed',
      message: `このエンドポイントは${allowedMethods.join('、')}メソッドのみサポートしています。`
    });
  }
  return false;
}

// リクエストボディの解析
function parseRequestBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (parseError) {
      throw new Error('Invalid JSON format');
    }
  }
  return body;
}

// エラーレスポンス
function sendErrorResponse(res, statusCode, error, message, details = null) {
  console.error('API Error:', error);
  return res.status(statusCode).json({
    error: error,
    message: message,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  });
}

// 成功レスポンス
function sendSuccessResponse(res, message, data = null) {
  return res.status(200).json({
    success: true,
    message: message,
    data: data
  });
}

module.exports = {
  escapeHtml,
  setCorsHeaders,
  handleOptions,
  validateMethod,
  parseRequestBody,
  sendErrorResponse,
  sendSuccessResponse
};
