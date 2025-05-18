// Universal Pine AI Chat API
// Next.js API route handler for chat completions

import { OpenAI } from 'openai';

// CORS設定
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.openai_key
});

export default async function handler(req, res) {
  // CORS対応
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // POSTリクエストのみ受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    setCorsHeaders(res);
    
    // リクエストボディからテキストを取得
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'テキストが必要です' });
    }

    console.log('Chat API received text:', text);

    // OpenAI APIを使用してチャット応答を生成
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "あなたはUniversal PineのAIアシスタントです。" },
        { role: "user", content: text }
      ],
      temperature: 0.7
    });

    const responseText = chat.choices[0].message.content;
    console.log('Chat API response:', responseText);

    // レスポンスを返す
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ 
      response: responseText,
      charset: 'utf-8'
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: '処理中にエラーが発生しました',
      details: error.message
    });
  }
}
