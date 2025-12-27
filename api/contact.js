const { Resend } = require('resend');
const { z } = require('zod');

// Resend client management
let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function isResendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

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

// 許可するオリジンのリスト
const ALLOWED_ORIGINS = [
  'https://universalpine.com',
  'https://www.universalpine.com'
];

// Common helper functions
function setCorsHeaders(res, req) {
  const origin = req?.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://universalpine.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, req);
    return res.status(200).end();
  }
  return false;
}

function validateMethod(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'このエンドポイントはPOSTメソッドのみサポートしています。'
    });
  }
  return false;
}

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

function sendErrorResponse(res, statusCode, error, message, details = null) {
  console.error('API Error:', error);
  return res.status(statusCode).json({
    error: error,
    message: message,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  });
}

function sendSuccessResponse(res, message, data = null) {
  return res.status(200).json({
    success: true,
    message: message,
    data: data
  });
}

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'お名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  category: z.string().min(1, 'カテゴリは必須です'),
  message: z.string().min(1, 'メッセージは必須です'),
  honeypot: z.string().optional()
});

// Honeypot spam detection
function isSpamBot(body) {
  // If honeypot field has any value, it's likely a bot
  if (body.honeypot && body.honeypot.trim() !== '') {
    // 本番環境ではログを抑制
    if (process.env.NODE_ENV === 'development') {
      console.log('Spam detected: honeypot field filled');
    }
    return true;
  }
  return false;
}

module.exports = async function handler(req, res) {
  // CORS設定
  setCorsHeaders(res, req);

  // OPTIONSリクエストの処理
  if (handleOptions(req, res)) return;

  // POSTメソッドのチェック
  if (validateMethod(req, res)) return;

  try {
    // Resend APIキーの存在確認
    if (!isResendConfigured()) {
      console.error('RESEND_API_KEY is not configured');
      return sendErrorResponse(res, 500, 'Email service not configured', 'メール送信サービスが設定されていません。');
    }

    // リクエストボディの解析
    const body = parseRequestBody(req);

    // スパムボット検出（ハニーポット）
    if (isSpamBot(body)) {
      // ボットには成功したように見せかける（再試行を防ぐため）
      return sendSuccessResponse(res, 'お問い合わせを受け付けました。');
    }

    // バリデーション
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation failed', '入力データに問題があります。', validationResult.error.errors);
    }

    const { name, email, category, message } = validationResult.data;
    const resend = getResendClient();

    // メール送信
    const emailData = await resend.emails.send({
      from: 'contact@universalpine.com',
      to: ['ho@universalpine.com'],
      subject: `【お問い合わせ】${escapeHtml(category)} - ${escapeHtml(name)}様より`,
      html: `
        <h2>お問い合わせフォームからのメッセージ</h2>
        <p><strong>お名前:</strong> ${escapeHtml(name)}</p>
        <p><strong>メールアドレス:</strong> ${escapeHtml(email)}</p>
        <p><strong>カテゴリ:</strong> ${escapeHtml(category)}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>このメッセージは、universalpine.comのお問い合わせフォームから送信されました。</small></p>
      `,
    });


    return sendSuccessResponse(res, 'お問い合わせを受け付けました。', { emailId: emailData.data?.id });

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', 'お問い合わせの処理中にエラーが発生しました。', error.message);
  }
};