// OpenAI APIを使用したチャットエンドポイント
import OpenAI from 'openai';

export default async function handler(req, res) {
  // POSTリクエストのみを許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    // テキストが提供されていない場合は早期リターン
    if (!text || text === 'ping') {
      return res.status(200).json({ text: 'APIサーバーは正常に動作しています' });
    }

    // OpenAI APIクライアントの初期化
    const openai = new OpenAI({
      apiKey: process.env.openai_key
    });

    // ChatGPT APIを使用して応答を生成
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "あなたはUniversal Pineの音声アシスタントです。簡潔で親しみやすい応答を日本語で提供してください。" },
        { role: "user", content: text }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    // 応答を返す
    return res.status(200).json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
