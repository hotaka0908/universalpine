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

// Common helper functions
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
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
const applySchema = z.object({
  name: z.string().min(1, 'お名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です'),
  postal_code: z.string().min(1, '郵便番号は必須です'),
  address_line1: z.string().min(1, '住所は必須です'),
  address_line2: z.string().optional(),
  position: z.string().min(1, '希望職種は必須です'),
  message: z.string().optional(),
  privacy: z.string().optional(),
  csrf_token: z.string().optional(),
  resume: z.any().optional(),
  portfolio: z.any().optional(),
  honeypot: z.string().optional()
});

// Honeypot spam detection
function isSpamBot(body) {
  // If honeypot field has any value, it's likely a bot
  if (body.honeypot && body.honeypot.trim() !== '') {
    console.log('Spam detected: honeypot field filled');
    return true;
  }
  return false;
}

module.exports = async function handler(req, res) {
  // CORS設定
  setCorsHeaders(res);

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
      return sendSuccessResponse(res, '応募を受け付けました。');
    }

    // バリデーション
    const validationResult = applySchema.safeParse(body);
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation failed', '入力データに問題があります。', validationResult.error.errors);
    }

    const { name, email, phone, postal_code, address_line1, address_line2, position, message } = validationResult.data;
    const resend = getResendClient();

    // メール送信
    const emailData = await resend.emails.send({
      from: 'apply@universalpine.com',
      to: ['ho@universalpine.com'],
      subject: `【応募フォーム】${escapeHtml(name)}様より`,
      html: `
        <h2>応募フォームからの申し込み</h2>
        <p><strong>お名前:</strong> ${escapeHtml(name)}</p>
        <p><strong>メールアドレス:</strong> ${escapeHtml(email)}</p>
        <p><strong>電話番号:</strong> ${escapeHtml(phone)}</p>
        <p><strong>郵便番号:</strong> ${escapeHtml(postal_code)}</p>
        <p><strong>住所:</strong> ${escapeHtml(address_line1)}</p>
        ${address_line2 ? `<p><strong>住所2:</strong> ${escapeHtml(address_line2)}</p>` : ''}
        <p><strong>希望職種:</strong> ${escapeHtml(position)}</p>
        ${message ? `<p><strong>メッセージ:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ''}
        <hr>
        <p><small>このメッセージは、universalpine.comの応募フォームから送信されました。</small></p>
      `,
    });


    return sendSuccessResponse(res, '応募を受け付けました。', { emailId: emailData.data?.id });

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', '応募の処理中にエラーが発生しました。', error.message);
  }
};