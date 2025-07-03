const { z } = require('zod');
const { Resend } = require('resend');

// Resendクライアントの初期化
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  category: z.string().min(1, 'カテゴリーは必須です'),
  message: z.string().min(1, 'メッセージは必須です'),
  privacy: z.string().optional(),
  honeypot: z.string().optional()
});

module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Protection Bypassのチェック（環境変数が設定されている場合）
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    const bypassToken = req.headers['x-vercel-protection-bypass'] || req.query['x-vercel-protection-bypass'];
    if (bypassToken && bypassToken === process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      // 認証をバイパス
      console.log('Protection bypass authorized');
    }
  }

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディの検証
    const parsed = schema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: parsed.error.errors 
      });
    }

    const data = parsed.data;

    // ハニーポットチェック（スパム対策）
    if (data.honeypot) {
      console.log('Spam detected via honeypot');
      return res.status(400).json({ error: 'Invalid request' });
    }

    // カテゴリの日本語表記
    const categoryLabels = {
      product: '製品について',
      media: '取材について',
      career: '採用について',
      partnership: '協業について',
      other: 'その他'
    };

    // メール本文を作成
    const emailBody = `
新しいお問い合わせがありました。

【お問い合わせ内容】
お名前: ${data.name}
メールアドレス: ${data.email}
カテゴリー: ${categoryLabels[data.category] || data.category}

【メッセージ】
${data.message}

-----
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
    `;

    // Resendを使用してメールを送信
    if (!resend) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'サーバー設定エラーが発生しました' });
    }
    try {
      // メインのお問い合わせメールを送信
      const mainEmailResult = await resend.emails.send({
        from: 'お問い合わせフォーム <onboarding@resend.dev>',
        to: ['ho@universalpine.com'],
        subject: `【お問い合わせ】${categoryLabels[data.category] || data.category} - ${data.name}様より`,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>'),
        reply_to: data.email
      });

      if (mainEmailResult.error) {
        console.error('Resend error (main email):', mainEmailResult.error);
        throw new Error('メール送信に失敗しました');
      }

      console.log('メール送信成功 (main):', mainEmailResult.data);

      // お問い合わせ者にも確認メールを送信
      const confirmationEmail = `
${data.name} 様

お問い合わせありがとうございます。
以下の内容でお問い合わせを受け付けました。

【お問い合わせ内容】
カテゴリー: ${categoryLabels[data.category] || data.category}

${data.message}

担当者より2営業日以内にご連絡させていただきます。

--
Universal Pine
株式会社ユニバーサルパイン
      `;

      const confirmationResult = await resend.emails.send({
        from: 'Universal Pine <onboarding@resend.dev>',
        to: [data.email],
        subject: 'お問い合わせ受付確認 - Universal Pine',
        text: confirmationEmail,
        html: confirmationEmail.replace(/\n/g, '<br>')
      });

      if (confirmationResult.error) {
        console.error('Resend error (confirmation email):', confirmationResult.error);
        // 確認メールの失敗は致命的ではないため、ログに記録するだけ
      } else {
        console.log('確認メール送信成功:', confirmationResult.data);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // メール送信に失敗してもフォーム送信は成功とする（ユーザーエクスペリエンスのため）
      console.log('フォームデータ:', emailBody);
    }

    // 成功レスポンスを返す
    res.status(200).json({ 
      ok: true,
      message: 'お問い合わせを受け付けました。担当者よりご連絡いたします。'
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'お問い合わせの処理中にエラーが発生しました。'
    });
  }
}