const { Resend } = require('resend');
const { getResendClient, isResendConfigured } = require('./utils/resend-client');
const { 
  setCorsHeaders, 
  handleOptions, 
  validateMethod, 
  parseRequestBody, 
  sendErrorResponse, 
  sendSuccessResponse,
  applySchema 
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
    const validationResult = applySchema.safeParse(body);
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation failed', '入力データに問題があります。', validationResult.error.errors);
    }

    const { name, email, phone, company, position, experience, reason } = validationResult.data;
    const resend = getResendClient();

    // メール送信
    const emailData = await resend.emails.send({
      from: 'apply@universalpine.com',
      to: ['ho@universalpine.com'],
      subject: `【応募フォーム】${name}様より`,
      html: `
        <h2>応募フォームからの申し込み</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>電話番号:</strong> ${phone || '未入力'}</p>
        <p><strong>所属企業:</strong> ${company || '未入力'}</p>
        <p><strong>役職:</strong> ${position || '未入力'}</p>
        <p><strong>経験年数:</strong> ${experience || '未入力'}</p>
        <p><strong>応募理由:</strong></p>
        <p>${reason.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>このメッセージは、universalpine.comの応募フォームから送信されました。</small></p>
      `,
    });

    console.log('Application email sent successfully:', emailData.data?.id);

    return sendSuccessResponse(res, '応募を受け付けました。', { emailId: emailData.data?.id });

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', '応募の処理中にエラーが発生しました。', error.message);
  }
};