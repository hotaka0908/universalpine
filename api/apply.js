const { z } = require('zod');
const { Resend } = require('resend');

const resend = process.env.resend_key ? new Resend(process.env.resend_key) : null;

const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です'),
  postal_code: z.string().min(1, '郵便番号は必須です'),
  address_line1: z.string().min(1, '住所は必須です'),
  address_line2: z.string().optional(),
  position: z.string().min(1, '応募職種は必須です'),
  resume: z.object({
    name: z.string(),
    type: z.string(),
    data: z.string()
  }),
  portfolio: z.object({
    name: z.string(),
    type: z.string(),
    data: z.string()
  }),
  message: z.string().optional(),
  privacy: z.string().optional()
});

const positionNames = {
  'electronics-engineer': 'エレクトロニクスエンジニア',
  'ai-engineer': 'AIエンジニア',
  'mechanical-engineer': 'メカニカルエンジニア',
  'embedded-engineer': '組み込みエンジニア',
  'mobile-app-engineer': 'モバイルアプリエンジニア',
  'open-entry': 'オープンエントリー',
  'part-time': 'アルバイト'
};

module.exports = async function handler(req, res) {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSメソッド対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // リクエストボディの存在確認
    if (!req.body) {
      console.error('No request body provided');
      return res.status(400).json({ error: 'リクエストボディが提供されていません' });
    }

  const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.errors);
      return res.status(400).json({ 
        error: '入力データに問題があります', 
        details: parsed.error.errors 
      });
    }
  const d = parsed.data;

  const fullAddress = d.address_line1 + (d.address_line2 ? ` ${d.address_line2}` : '');

  const emailBody = `
【応募情報】

氏名: ${d.name}
メールアドレス: ${d.email}
電話番号: ${d.phone}
郵便番号: ${d.postal_code}
住所: ${fullAddress}

応募職種: ${positionNames[d.position] || d.position}

【メッセージ】
${d.message || '特になし'}

-----
このメールには履歴書・職務経歴書が添付されています。
`;

  if (!resend) {
          console.error('resend_key is not set');
      return res.status(500).json({ 
        error: 'サーバー設定エラーが発生しました',
        message: 'メール送信の設定が正しく行われていません。管理者にお問い合わせください。'
      });
  }
    // メインのお問い合わせメールを送信
    const mainEmailResult = await resend.emails.send({
      from: '採用応募 <onboarding@resend.dev>',
      to: ['ho@universalpine.com'],
      subject: `【採用応募】${positionNames[d.position] || d.position} - ${d.name}様`,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
      attachments: [
        {
          filename: d.resume.name,
          content: d.resume.data,
          type: d.resume.type,
          encoding: 'base64'
        },
        {
          filename: d.portfolio.name,
          content: d.portfolio.data,
          type: d.portfolio.type,
          encoding: 'base64'
        }
      ]
    });

    if (mainEmailResult.error) {
      console.error('Resend error (main email):', mainEmailResult.error);
      return res.status(500).json({ 
        error: 'メール送信に失敗しました',
        message: '応募の送信中にエラーが発生しました。後でもう一度お試しください。'
      });
    }

    // 応募者にも確認メールを送信
    const confirmationEmail = `
${d.name} 様

採用応募ありがとうございます。
以下の内容で応募を受け付けました。

【応募内容】
応募職種: ${positionNames[d.position] || d.position}

${d.message || ''}

担当者より1週間以内にご連絡させていただきます。

--
Universal Pine
株式会社ユニバーサルパイン
    `;

    try {
    await resend.emails.send({
      from: 'Universal Pine <onboarding@resend.dev>',
      to: [d.email],
      subject: '採用応募受付確認 - Universal Pine',
      text: confirmationEmail,
      html: confirmationEmail.replace(/\n/g, '<br>')
    });
    } catch (confirmationError) {
      console.error('Confirmation email error:', confirmationError);
      // 確認メールの送信失敗はログに記録するが、メインの処理は続行
    }

    res.status(200).json({ 
      ok: true, 
      message: '応募を受信しました。担当者から連絡します。'
    });
  } catch (error) {
    console.error('Error processing apply form:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: '応募の処理中にエラーが発生しました。'
    });
  }
}
