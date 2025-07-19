import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request) {
  // CORS設定のためのヘッダー
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...headers 
        } 
      }
    );
  }

  try {
    // Resend APIキーの存在確認
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...headers 
          } 
        }
      );
    }

    // リクエストボディの解析
    let body;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...headers 
          } 
        }
      );
    }

    const { name, email, category, message } = body;

    // 必須フィールドの検証
    if (!name || !email || !category || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, category, message' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...headers 
          } 
        }
      );
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'お問い合わせを受け付けました。',
        emailId: emailData.data?.id 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...headers 
        } 
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...headers 
        } 
      }
    );
  }
}
