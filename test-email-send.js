const { getResendClient, isResendConfigured } = require('./api/utils/resend-client');

async function testEmailSend() {
  console.log('Testing Resend API email sending...');
  
  if (!isResendConfigured()) {
    console.error('❌ resend_key environment variable is not set');
    console.log('Please set the resend_key environment variable with your Resend API key');
    process.exit(1);
  }

  const resend = getResendClient();
  
  if (!resend) {
    console.error('❌ Failed to initialize Resend client');
    process.exit(1);
  }

  console.log('✅ Resend client initialized successfully');

  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    category: 'product',
    message: 'This is a test message to verify email sending functionality.'
  };

  const categoryLabels = {
    product: '製品について',
    media: '取材について',
    career: '採用について',
    partnership: '協業について',
    other: 'その他'
  };

  const emailBody = `
新しいお問い合わせがありました。

【お問い合わせ内容】
お名前: ${testData.name}
メールアドレス: ${testData.email}
カテゴリー: ${categoryLabels[testData.category] || testData.category}

【メッセージ】
${testData.message}

-----
送信日時: ${new Date().toLocaleString('ja-JP')}
テスト送信: YES
  `;

  try {
    console.log('📧 Sending test email to ho@universalpine.com...');
    
    const result = await resend.emails.send({
      from: 'Universal Pine <onboarding@resend.dev>',
      to: ['ho@universalpine.com'],
      subject: `【テスト送信】${categoryLabels[testData.category]} - ${testData.name}様より`,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
      reply_to: testData.email
    });

    console.log('📬 Email send result:', result);
    
    if (result.error) {
      console.error('❌ Email sending failed:', result.error);
      console.error('Error details:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('📮 Sent to: ho@universalpine.com');
    console.log('📝 Subject:', `【テスト送信】${categoryLabels[testData.category]} - ${testData.name}様より`);
    
  } catch (error) {
    console.error('❌ Error during email sending:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testEmailSend();
}

module.exports = { testEmailSend };
