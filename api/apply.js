const { getResendClient, isResendConfigured } = require('./utils/resend-client');

// 職種名のマッピング
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
  // CORS設定（お問い合わせフォームと同じ）
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
    const { name, email, phone, postal_code, address_line1, address_line2, position, message } = req.body;

    // バリデーション（お問い合わせフォームと同じパターン）
    if (!name || !email || !phone || !postal_code || !address_line1 || !position) {
      return res.status(400).json({ 
        error: '必須項目が入力されていません',
        message: 'すべての必須項目を入力してください。'
      });
    }

    // 住所の結合
    const fullAddress = address_line1 + (address_line2 ? ` ${address_line2}` : '');
    const positionLabel = positionNames[position] || position;

    // メール本文作成（お問い合わせフォームと同じスタイル）
    const emailBody = `
【採用応募】新しい応募が届きました

■ 応募者情報
氏名: ${name}
メールアドレス: ${email}
電話番号: ${phone}
郵便番号: ${postal_code}
住所: ${fullAddress}

■ 応募内容
応募職種: ${positionLabel}

■ メッセージ
${message || '特になし'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
この応募は Universal Pine 採用サイトから送信されました。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    console.log('Sending email to ho@universalpine.com');

    // メール送信（お問い合わせフォームと同じパターン）
    const result = await resend.emails.send({
      from: 'Universal Pine 採用 <onboarding@resend.dev>',
      to: ['ho@universalpine.com'],
      subject: `【採用応募】${positionLabel} - ${name}様`,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>')
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(500).json({ 
        error: 'メール送信に失敗しました',
        message: '応募の送信中にエラーが発生しました。しばらくしてからもう一度お試しください。'
      });
    }

    console.log('Email sent successfully:', result);

    // 成功レスポンス（お問い合わせフォームと同じ形式）
    return res.status(200).json({ 
      success: true,
      message: '応募が正常に送信されました。ご応募ありがとうございます。'
    });

  } catch (error) {
    console.error('Error processing application:', error);
    return res.status(500).json({ 
      error: 'サーバーエラー',
      message: '応募の処理中にエラーが発生しました。しばらくしてからもう一度お試しください。'
    });
  }
};
