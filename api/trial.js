const { z } = require('zod');
const { getResendClient, isResendConfigured } = require('./utils/resend-client');

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  date: z.string().min(1, '日付は必須です'),
  time: z.string().min(1, '時間は必須です'),
  participants: z.string(),
  interests: z.string().min(1, '関心のある職種を選択してください'),
  message: z.string().optional()
});

module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディの存在確認
    if (!req.body) {
      console.error('No request body provided');
      return res.status(400).json({ 
        error: 'リクエストボディが提供されていません',
        message: 'フォームデータが正しく送信されませんでした。'
      });
    }

    // リクエストボディの検証
    const parsed = schema.safeParse(req.body);
    
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.errors);
      return res.status(400).json({ 
        error: '入力データに問題があります',
        message: '入力内容を確認してください。',
        details: parsed.error.errors 
      });
    }

    const data = parsed.data;

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
      console.warn('RESEND_API_KEYが設定されていません。メールは送信されません。');
      console.log('フォームデータ:', emailBody);
    } else {
    const resend = getResendClient();
    try {
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
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // メール送信に失敗してもフォーム送信は成功とする（ユーザーエクスペリエンスのため）
      console.log('フォームデータ:', emailBody);
    }
    }

    // 成功レスポンスを返す
    res.status(200).json({ 
      ok: true,
      message: 'プロジェクト体験の申し込みを受け付けました。確認メールをお送りいたします。'
    });

  } catch (error) {
    console.error('Error processing trial application:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: '申し込みの処理中にエラーが発生しました。'
    });
  }
}
