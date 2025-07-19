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

    const { name, email, phone, company, position, experience, reason } = body;

    // 必須フィールドの検証
    if (!name || !email || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, reason' 
      });
    }

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

    return res.status(200).json({ 
      success: true, 
      message: '応募を受け付けました。',
      emailId: emailData.data?.id 
    });

  } catch (error) {
    console.error('Application form error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
