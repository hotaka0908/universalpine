export default function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
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
      method: request.method,
      user_agent: request.headers.get('user-agent') || 'N/A',
    }
  };

  console.log('Test API called:', response);
  
  return new Response(
    JSON.stringify(response, null, 2),
    { status: 200, headers }
  );
} 