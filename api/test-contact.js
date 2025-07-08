module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-vercel-protection-bypass');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('テストAPI呼び出し:', req.body);
    
    // 成功レスポンスを返す
    res.status(200).json({ 
      ok: true,
      message: 'テストAPIが正常に動作しています',
      receivedData: req.body
    });

  } catch (error) {
    console.error('Test API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'テストAPIでエラーが発生しました。'
    });
  }
} 