const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Resend APIキーの存在確認
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // リクエストボディの解析
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
    }

    const { name, email, category, message } = body;

    // 必須フィールドの検証
    if (!name || !email || !category || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, category, message' 
      });
    }

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

    return res.status(200).json({ 
      success: true, 
      message: 'お問い合わせを受け付けました。',
      emailId: emailData.data?.id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
