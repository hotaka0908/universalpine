import { z } from 'zod';

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  category: z.string().min(1, 'カテゴリーは必須です'),
  message: z.string().min(1, 'メッセージは必須です'),
  privacy: z.string().optional()
});

export default async function handler(req, res) {
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
    // リクエストボディの検証
    const parsed = schema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: parsed.error.errors 
      });
    }

    const data = parsed.data;

    // メール本文を作成
    const emailBody = `
新しいお問い合わせがありました。

【お問い合わせ内容】
お名前: ${data.name}
メールアドレス: ${data.email}
カテゴリー: ${data.category}

【メッセージ】
${data.message}

-----
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
    `;

    // ここで実際のメール送信処理を行う
    // 本番環境では、SendGrid、AWS SES、Nodemailerなどを使用
    console.log('お問い合わせを受信しました:');
    console.log(emailBody);

    // 本番環境では、ここでho@universalpine.comにメールを送信
    // 例: await sendEmail({
    //   to: 'ho@universalpine.com',
    //   subject: `お問い合わせ - ${data.category} - ${data.name}`,
    //   body: emailBody
    // });

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