module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = {
      status: "success",
      message: "API is working perfectly!",
      timestamp: new Date().toISOString(),
      method: req.method,
      environment_checks: {
        resend_api_key_exists: !!process.env.RESEND_API_KEY,
        resend_api_key_length: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        resend_api_key_prefix: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'not_set',
        node_version: process.version,
        working_directory: process.cwd()
      },
      request_info: {
        url: req.url,
        headers: req.headers,
        query: req.query || 'none'
      }
    };

    console.log('Test API called successfully:', response);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Test API error:', error);
    
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}; 