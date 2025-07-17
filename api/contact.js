const { getResendClient, isResendConfigured } = require('./utils/resend-client');

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

  // 環境変数チェック
  if (!isResendConfigured()) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ 
      error: 'サーバー設定エラー',
      message: 'メール送信サービスが正しく設定されていません。'
    });
  }

  // Resendクライアントの取得
  const resend = getResendClient();

  try {
    console.log('Request body:', req.body);
    const { name, email, category, message } = req.body;

    // バリデーション
    if (!name || !email || !category || !message) {
      return res.status(400).json({ 
        error: '必須項目が入力されていません',
        message: 'すべての必須項目を入力してください。'
      });
    }

    // カテゴリの日本語表記
    const categoryLabels = {
      product: '製品について',
      media: '取材について',
      career: '採用について',
      partnership: '協業について',
      other: 'その他'
    };

    // メール本文作成
    const emailBody = `
新しいお問い合わせがありました。

【お問い合わせ内容】
お名前: ${name}
メールアドレス: ${email}
カテゴリー: ${categoryLabels[category] || category}

【メッセージ】
${message}

-----
送信日時: ${new Date().toLocaleString('ja-JP')}
    `;

    console.log('メール送信開始...');
    console.log('送信先:', 'ho@universalpine.com');
    console.log('送信者:', email);

    // Resendでメール送信
    const result = await resend.emails.send({
      from: 'Universal Pine <onboarding@resend.dev>',
      to: ['ho@universalpine.com'],
      subject: `【お問い合わせ】${categoryLabels[category] || category} - ${name}様より`,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
      reply_to: email
    });

    console.log('Resend response:', result);
    console.log('Email ID:', result.data?.id);
    console.log('Email status:', result.data ? 'sent' : 'failed');

    if (result.error) {
      console.error('Resend error:', result.error);
      console.error('Error details:', JSON.stringify(result.error, null, 2));
      throw new Error(`メール送信に失敗しました: ${result.error.message || 'Unknown error'}`);
    }

    console.log('メール送信成功:', result.data);
    console.log('送信完了 - Email ID:', result.data?.id, 'to:', 'ho@universalpine.com');

    res.status(200).json({ 
      success: true,
      message: 'お問い合わせを受け付けました。担当者よりご連絡いたします。'
    });

  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).json({ 
      error: 'メール送信に失敗しました',
      message: error.message || 'メールの送信に失敗しました。しばらく時間をおいて再度お試しください。'
    });
  }
};
