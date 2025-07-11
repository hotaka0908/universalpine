const { z } = require('zod');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.errors);
      return res.status(400).json({ error: 'invalid', details: parsed.error.errors });
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
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'サーバー設定エラーが発生しました' });
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
      throw new Error('メール送信に失敗しました');
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

    await resend.emails.send({
      from: 'Universal Pine <onboarding@resend.dev>',
      to: [d.email],
      subject: '採用応募受付確認 - Universal Pine',
      text: confirmationEmail,
      html: confirmationEmail.replace(/\n/g, '<br>')
    });

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
