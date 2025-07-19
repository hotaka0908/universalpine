module.exports = function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 環境変数の存在確認
  const resendApiKey = process.env.RESEND_API_KEY;
  const nodeEnv = process.env.NODE_ENV;

  const response = {
    status: 'success',
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString(),
    environment_checks: {
      resend_api_key_exists: !!resendApiKey,
      resend_api_key_length: resendApiKey ? resendApiKey.length : 0,
      node_env: nodeEnv,
    },
    api_info: {
      path: '/api/test',
      method: req.method,
      user_agent: req.headers['user-agent'] || 'N/A',
    }
  };

  console.log('Test API called:', response);
  
  return res.status(200).json(response);
}; 