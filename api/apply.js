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

    const { name, email, phone, company, position, experience, reason } = body;

    // 必須フィールドの検証
    if (!name || !email || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, reason' }),
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '応募を受け付けました。',
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
    console.error('Application form error:', error);
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
