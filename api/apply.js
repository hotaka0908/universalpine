// Vercel Serverless Function for handling form submissions
import { z } from 'zod';
import nodemailer from 'nodemailer';

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string().min(1, "お名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().min(1, "電話番号は必須です"),
  postal_code: z.string().min(1, "郵便番号は必須です"),
  address_line1: z.string().min(1, "住所は必須です"),
  position: z.string().min(1, "応募職種は必須です"),
  resume_url: z.string().url("履歴書URLの形式が正しくありません"),
  portfolio_url: z.string().url("職務経歴書URLの形式が正しくありません"),
  message: z.string().optional(),
  csrf_token: z.string(),
  hp: z.string().max(0, "ボットによる送信と判断されました").optional() // ハニーポット
});

// 入力値のサニタイズ関数
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>&"']/g, function(match) {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return match;
    }
  });
}

// フォームデータをサニタイズする関数
function sanitizeFormData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = sanitizeInput(value);
  }
  return sanitized;
}

// メール送信関数
async function sendEmail(data) {
  // nodemailerのトランスポーターを設定
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // 職種名を日本語に変換
  const positionMap = {
    'electronics-engineer': 'エレクトロニクスエンジニア',
    'ai-engineer': 'AIエンジニア',
    'mechanical-engineer': 'メカニカルエンジニア',
    'embedded-engineer': '組み込みエンジニア',
    'mobile-app-engineer': 'モバイルアプリエンジニア',
    'open-entry': 'オープンエントリー',
    'part-time': 'アルバイト'
  };

  // メールの内容を作成
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: 'ho@universalpine.com',
    subject: `採用応募: ${positionMap[data.position] || data.position}`,
    text: `
      Universal Pine 採用担当者様

      以下の内容で応募がありました。

      名前: ${data.name}

      メールアドレス: ${data.email}

      電話番号: ${data.phone}

      郵便番号: ${data.postal_code}

      住所: ${data.address_line1}
      ${data.address_line2 ? data.address_line2 + '\n' : ''}
      希望ポジション: ${positionMap[data.position] || data.position}

      履歴書URL: ${data.resume_url}

      職務経歴書URL: ${data.portfolio_url}

      メッセージ: ${data.message || '記入なし'}

      送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
    `,
    replyTo: data.email
  };

  // メール送信
  return await transporter.sendMail(mailOptions);
}

// APIハンドラー
export default async function handler(req, res) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // リクエストボディのサニタイズ
    const sanitizedData = sanitizeFormData(req.body);

    // ハニーポットチェック
    if (sanitizedData.hp && sanitizedData.hp.length > 0) {
      // ボット対策: 成功を装って200を返す
      return res.status(200).json({ message: 'Form submitted successfully' });
    }

    // バリデーション
    const validationResult = schema.safeParse(sanitizedData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.map(err => err.message)
      });
    }

    // CSRFトークン検証 (実際の実装ではセッションと照合する)
    // 注: このサンプルでは簡易的な実装
    if (!sanitizedData.csrf_token) {
      return res.status(403).json({ message: 'CSRF token missing' });
    }

    // メール送信
    await sendEmail(validationResult.data);

    // 成功レスポンス
    return res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
