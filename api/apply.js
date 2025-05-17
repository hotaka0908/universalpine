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

  // メール送信をシミュレート
  console.log('応募データを受信しました:', {
    name: d.name,
    email: d.email,
    position: positionNames[d.position] || d.position,
    date: new Date().toISOString()
  });
  
  // 成功レスポンスを返す
  res.status(200).json({ 
    ok: true, 
    message: '応募を受信しました。担当者から連絡します。'
  });
}
