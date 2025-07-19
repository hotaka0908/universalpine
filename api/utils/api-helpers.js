const { z } = require('zod');

// 共通のCORS設定
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

// POSTメソッドのチェック
function validateMethod(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'このエンドポイントはPOSTメソッドのみサポートしています。'
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

// 共通のエラーレスポンス
function sendErrorResponse(res, statusCode, error, message, details = null) {
  console.error('API Error:', error);
  return res.status(statusCode).json({
    error: error,
    message: message,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  });
}

// 共通の成功レスポンス
function sendSuccessResponse(res, message, data = null) {
  return res.status(200).json({
    success: true,
    message: message,
    data: data
  });
}

// バリデーションスキーマ
const contactSchema = z.object({
  name: z.string().min(1, 'お名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  category: z.string().min(1, 'カテゴリは必須です'),
  message: z.string().min(1, 'メッセージは必須です')
});

const applySchema = z.object({
  name: z.string().min(1, 'お名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  experience: z.string().optional(),
  reason: z.string().min(1, '応募理由は必須です')
});

const trialSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  date: z.string().min(1, '日付は必須です'),
  time: z.string().min(1, '時間は必須です'),
  participants: z.string(),
  interests: z.string().min(1, '関心のある職種を選択してください'),
  message: z.string().optional()
});

module.exports = {
  setCorsHeaders,
  handleOptions,
  validateMethod,
  parseRequestBody,
  sendErrorResponse,
  sendSuccessResponse,
  contactSchema,
  applySchema,
  trialSchema
};