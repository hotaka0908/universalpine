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
const trialSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  date: z.string().min(1, '日付は必須です'),
  time: z.string().min(1, '時間は必須です'),
  participants: z.string(),
  interests: z.string().min(1, '関心のある職種を選択してください'),
  message: z.string().optional(),
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
    // リクエストボディの解析
    const body = parseRequestBody(req);

    // スパムボット検出（ハニーポット）
    if (isSpamBot(body)) {
      // ボットには成功したように見せかける（再試行を防ぐため）
      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。');
    }

    // バリデーション
    const validationResult = trialSchema.safeParse(body);
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation failed', '入力データに問題があります。', validationResult.error.errors);
    }

    const data = validationResult.data;

    // メール本文を作成
    const emailBody = `
新しいプロジェクト体験の申し込みがありました。

【申込者情報】
名前: ${data.name}
メールアドレス: ${data.email}

【希望日時】
日付: ${data.date}
時間: ${data.time}
参加人数: ${data.participants}名

【関心のある職種】
${data.interests}

【メッセージ】
${data.message || 'なし'}

-----
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
    `;

    // Resendを使用してメールを送信
    if (!isResendConfigured()) {
      console.warn('RESEND_API_KEY が設定されていません。メールは送信されません。');
      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。（開発モード）');
    }

    const resend = getResendClient();
    
    try {
      // 管理者への通知メール
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Universal Pine <noreply@universalpine.com>',
        to: ['ho@universalpine.com'],
        subject: `プロジェクト体験申込 - ${escapeHtml(data.name)}`,
        text: emailBody,
        html: escapeHtml(emailBody).replace(/\n/g, '<br>'),
        reply_to: data.email
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        throw new Error('メール送信に失敗しました');
      }


      // 申込者にも確認メールを送信
      const confirmationEmail = `
${data.name} 様

この度は、Universal Pineのプロジェクト体験にお申し込みいただき、誠にありがとうございます。

以下の内容でお申し込みを受け付けました：

【お申し込み内容】
希望日: ${data.date}
希望時間: ${data.time}
参加人数: ${data.participants}名

担当者より2営業日以内にご連絡させていただきます。

何かご不明な点がございましたら、このメールにご返信ください。

--
Universal Pine
株式会社ユニバーサルパイン
      `;

      await resend.emails.send({
        from: 'Universal Pine <noreply@universalpine.com>',
        to: [data.email],
        subject: 'プロジェクト体験お申し込み確認',
        text: confirmationEmail,
        html: escapeHtml(confirmationEmail).replace(/\n/g, '<br>')
      });

      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。確認メールをお送りいたします。', { emailId: emailData?.id });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // メール送信に失敗した場合はエラーを返す
      return sendErrorResponse(res, 500, 'Email sending failed', 'メールの送信に失敗しました。お手数ですが、時間をおいて再度お試しください。');
    }

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', '申し込みの処理中にエラーが発生しました。', error.message);
  }
};