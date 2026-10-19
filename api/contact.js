const { z } = require('zod');
const { getResendClient, isResendConfigured } = require('./_lib/resend-client');
const {
  escapeHtml,
  setCorsHeaders,
  handleOptions,
  validateMethod,
  parseRequestBody,
  sendErrorResponse,
  sendSuccessResponse
} = require('./_lib/helpers');
const { checkRateLimit } = require('./_lib/rate-limit');

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'お名前は必須です').max(100, 'お名前は100文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください').max(254, 'メールアドレスが長すぎます'),
  category: z.string().min(1, 'カテゴリは必須です').max(50, 'カテゴリは50文字以内で入力してください'),
  message: z.string().min(1, 'メッセージは必須です').max(5000, 'メッセージは5000文字以内で入力してください'),
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
    // レート制限（IP単位: 10分間に10回まで）。ハニーポットと入力検証の後に行い、
    // ボットや入力ミスが同じ回線（モバイル回線・社内NAT）の他の人の枠を消費しないようにする。
    const allowed = await checkRateLimit(req, 'contact', { max: 10, windowSeconds: 600 });
    if (!allowed) {
      return sendErrorResponse(res, 429, 'Too many requests', '送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。');
    }

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