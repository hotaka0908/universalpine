const { Resend } = require('resend');
const { getResendClient, isResendConfigured } = require('./utils/resend-client');
const { 
  setCorsHeaders, 
  handleOptions, 
  validateMethod, 
  parseRequestBody, 
  sendErrorResponse, 
  sendSuccessResponse,
  contactSchema 
} = require('./utils/api-helpers');

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
      subject: `【お問い合わせ】${category} - ${name}様より`,
      html: `
        <h2>お問い合わせフォームからのメッセージ</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>カテゴリ:</strong> ${category}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>このメッセージは、universalpine.comのお問い合わせフォームから送信されました。</small></p>
      `,
    });

    console.log('Email sent successfully:', emailData.data?.id);

    return sendSuccessResponse(res, 'お問い合わせを受け付けました。', { emailId: emailData.data?.id });

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', 'お問い合わせの処理中にエラーが発生しました。', error.message);
  }
};