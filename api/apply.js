import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { z } from 'zod';

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  postal_code: z.string(),
  address_line1: z.string(),
  address_line2: z.string().optional(),
  position: z.string(),
  resume_url: z.string().url(),
  portfolio_url: z.string().url(),
  message: z.string().optional(),
  hp: z.string().optional()
});

// 職種名の日本語マッピング
const positionNames = {
  'electronics-engineer': 'エレクトロニクスエンジニア',
  'ai-engineer': 'AIエンジニア',
  'mechanical-engineer': 'メカニカルエンジニア',
  'embedded-engineer': '組み込みエンジニア',
  'mobile-app-engineer': 'モバイルアプリエンジニア',
  'open-entry': 'オープンエントリー',
  'part-time': 'アルバイト'
};

// 機密情報をマスクする関数
function maskSensitiveInfo(text) {
  if (!text) return '';
  if (text.length <= 4) return '*'.repeat(text.length);
  return text.substring(0, 2) + '*'.repeat(text.length - 4) + text.substring(text.length - 2);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.hp) return res.status(400).json({ error: 'invalid' });
  const d = parsed.data;

  // 住所を結合
  const fullAddress = d.address_line1 + (d.address_line2 ? ` ${d.address_line2}` : '');

  // 安全なメール本文を作成（機密情報をマスク）
  const emailBody = `
【応募情報】

氏名: ${d.name}
メールアドレス: ${d.email}
電話番号: ${maskSensitiveInfo(d.phone)}
郵便番号: ${maskSensitiveInfo(d.postal_code)}
住所: ${maskSensitiveInfo(fullAddress)}

応募職種: ${positionNames[d.position] || d.position}

履歴書URL: ${d.resume_url}
職務経歴書URL: ${d.portfolio_url}

【メッセージ】
${d.message || '特になし'}

-----
※電話番号、郵便番号、住所はセキュリティのためマスクされています。
※詳細情報は管理システムでご確認ください。
  `;

  // 管理システム用の完全なデータ（本番環境では安全な保存先に保存する）
  const fullData = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    postal_code: d.postal_code,
    address: fullAddress,
    position: d.position,
    position_name: positionNames[d.position] || d.position,
    resume_url: d.resume_url,
    portfolio_url: d.portfolio_url,
    message: d.message || '',
    application_date: new Date().toISOString()
  };

  // Resendインスタンスの作成
  const resend = new Resend(process.env.RESEND_API_KEY || 're_ArivSj2Y_6smWLhLoYTg7YewjtmuiXDbW');
  
  // メール送信の実行
  try {
    // Resendを使用してメール送信
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.TO_EMAIL,
      subject: `【応募】${d.name} さん - ${positionNames[d.position] || d.position}`,
      text: emailBody,
      attachments: [
        {
          filename: 'application_data.json',
          content: Buffer.from(JSON.stringify(fullData, null, 2)),
          contentType: 'application/json'
        }
      ]
    });
    
    // Resendでエラーが発生した場合、Nodemailerにフォールバック
    if (error) {
      console.warn('Resend email error, falling back to Nodemailer:', error);
      await sendWithNodemailer();
    } else {
      console.log('Email sent successfully with Resend, ID:', data?.id);
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Email sending error with Resend:', error);
    
    // Resendが完全に失敗した場合、Nodemailerを試す
    try {
      await sendWithNodemailer();
      res.status(200).json({ ok: true });
    } catch (nodemailerError) {
      console.error('Fallback to Nodemailer also failed:', nodemailerError);
      res.status(500).json({ error: 'email_error', message: 'メール送信に失敗しました' });
    }
  }
  
  // Nodemailerを使用したメール送信関数（フォールバック用）
  async function sendWithNodemailer() {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD }
    });
    
    await transporter.sendMail({
      from: `"応募フォーム" <${process.env.MAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `【応募】${d.name} さん - ${positionNames[d.position] || d.position}`,
      text: emailBody,
      attachments: [
        {
          filename: 'application_data.json',
          content: JSON.stringify(fullData, null, 2),
          contentType: 'application/json'
        }
      ]
    });
    
    console.log('Email sent successfully with Nodemailer fallback');
  }
}
