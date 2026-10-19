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
const applySchema = z.object({
  name: z.string().min(1, 'お名前は必須です').max(100, 'お名前は100文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください').max(254, 'メールアドレスが長すぎます'),
  phone: z.string().min(1, '電話番号は必須です').max(20, '電話番号が長すぎます'),
  postal_code: z.string().min(1, '郵便番号は必須です').max(10, '郵便番号が長すぎます'),
  address_line1: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  address_line2: z.string().max(200, '住所は200文字以内で入力してください').optional(),
  position: z.string().min(1, '希望職種は必須です').max(50, '希望職種は50文字以内で入力してください'),
  documents: z.string().max(10000, 'ドキュメントが長すぎます').optional(),
  message: z.string().max(5000, 'メッセージは5000文字以内で入力してください').optional(),
  privacy: z.string().optional(),
  csrf_token: z.string().optional(),
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
      return sendSuccessResponse(res, '応募を受け付けました。');
    }

    // バリデーション
    const validationResult = applySchema.safeParse(body);
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation failed', '入力データに問題があります。', validationResult.error.errors);
    }

    const { name, email, phone, postal_code, address_line1, address_line2, position, documents, message } = validationResult.data;
    // レート制限（IP単位: 10分間に10回まで）。ハニーポットと入力検証の後に行い、
    // ボットや入力ミスが同じ回線（モバイル回線・社内NAT）の他の人の枠を消費しないようにする。
    const allowed = await checkRateLimit(req, 'apply', { max: 10, windowSeconds: 600 });
    if (!allowed) {
      return sendErrorResponse(res, 429, 'Too many requests', '送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。');
    }

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
        ${documents ? `<p><strong>履歴書・職務経歴書:</strong></p><p>${escapeHtml(documents).replace(/\n/g, '<br>')}</p>` : ''}
        ${message ? `<p><strong>応募する理由:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ''}
        <hr>
        <p><small>このメッセージは、universalpine.comの応募フォームから送信されました。</small></p>
      `,
    });


    return sendSuccessResponse(res, '応募を受け付けました。', { emailId: emailData.data?.id });

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', '応募の処理中にエラーが発生しました。', error.message);
  }
};