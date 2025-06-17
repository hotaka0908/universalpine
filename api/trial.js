import { z } from 'zod';

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

    // ここで実際のメール送信処理を行う
    // 本番環境では、SendGrid、AWS SES、Nodemailerなどを使用
    console.log('プロジェクト体験申込を受信しました:');
    console.log(emailBody);

    // 本番環境では、ここでho@universalpine.comにメールを送信
    // 例: await sendEmail({
    //   to: 'ho@universalpine.com',
    //   subject: `プロジェクト体験申込 - ${data.name}`,
    //   body: emailBody
    // });

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