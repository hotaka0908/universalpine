const { z } = require('zod');
const { getResendClient, isResendConfigured } = require('./utils/resend-client');
const { 
  setCorsHeaders, 
  handleOptions, 
  validateMethod, 
  parseRequestBody, 
  sendErrorResponse, 
  sendSuccessResponse,
  trialSchema 
} = require('./utils/api-helpers');

module.exports = async function handler(req, res) {
  // CORS設定
  setCorsHeaders(res);

  // OPTIONSリクエストの処理
  if (handleOptions(req, res)) return;

  // POSTメソッドのチェック
  if (validateMethod(req, res)) return;

  try {
    // リクエストボディの解析
    const body = parseRequestBody(req);

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
      console.log('フォームデータ:', emailBody);
      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。（開発モード）');
    }

    const resend = getResendClient();
    
    try {
      // 管理者への通知メール
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Universal Pine <noreply@universalpine.com>',
        to: ['ho@universalpine.com'],
        subject: `プロジェクト体験申込 - ${data.name}`,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>'),
        reply_to: data.email
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        throw new Error('メール送信に失敗しました');
      }

      console.log('メール送信成功:', emailData);

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
        html: confirmationEmail.replace(/\n/g, '<br>')
      });

      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。確認メールをお送りいたします。', { emailId: emailData?.id });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // メール送信に失敗してもフォーム送信は成功とする（ユーザーエクスペリエンスのため）
      console.log('フォームデータ:', emailBody);
      return sendSuccessResponse(res, 'プロジェクト体験の申し込みを受け付けました。（メール送信エラー）');
    }

  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error', '申し込みの処理中にエラーが発生しました。', error.message);
  }
};