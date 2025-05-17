import { Resend } from 'resend';

// Resend APIキーを環境変数から取得
const resend = new Resend(process.env.resend_key);

export default async function handler(req, res) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディからフォームデータを取得
    const {
      name,
      email,
      phone,
      position,
      resume,
      portfolio,
      message,
      postal_code,
      address_line1,
      address_line2
    } = req.body;

    // 必須フィールドの検証
    if (!name || !email || !position) {
      return res.status(400).json({ error: '必須項目が入力されていません' });
    }

    // メール送信
    const data = await resend.emails.send({
      from: 'Universal Pine <noreply@universalpine.com>',
      to: 'ho@universalpine.com',
      subject: `新しい応募: ${position}ポジション`,
      html: `
        <h2>Universal Pine 応募フォーム</h2>
        <p><strong>応募ポジション:</strong> ${position}</p>
        <p><strong>氏名:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>電話番号:</strong> ${phone || 'なし'}</p>
        <p><strong>郵便番号:</strong> ${postal_code || 'なし'}</p>
        <p><strong>住所:</strong> ${address_line1 || 'なし'} ${address_line2 || ''}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message || 'なし'}</p>
        <p><strong>履歴書:</strong> ${resume ? '添付あり' : 'なし'}</p>
        <p><strong>職務経歴書:</strong> ${portfolio ? '添付あり' : 'なし'}</p>
      `,
      // 履歴書が添付されている場合の処理
      attachments: [
        ...(resume ? [{
          filename: resume.name,
          content: resume.data,
          encoding: 'base64'
        }] : []),
        ...(portfolio ? [{
          filename: portfolio.name,
          content: portfolio.data,
          encoding: 'base64'
        }] : [])
      ]
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('応募フォーム送信エラー:', error);
    return res.status(500).json({ error: '応募の送信中にエラーが発生しました' });
  }
}
