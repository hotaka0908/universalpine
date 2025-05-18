// Universal Pine AI Speech API
// Next.js API route handler for text-to-speech conversion

import { OpenAI } from 'openai';
import { Readable } from 'stream';

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

// Stream to Buffer conversion
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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

    console.log('Speech API received text:', text);

    // 音声合成でテキストを読み上げる
    const speechResp = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input: text
    });
    
    // 音声データをバッファに変換
    const audioBuffer = await streamToBuffer(speechResp.body);
    console.log('Speech API: Audio buffer size:', audioBuffer.length);
    
    // 音声データを返す
    res.setHeader('Content-Type', 'audio/wav; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.wav"');
    setCorsHeaders(res);
    res.send(audioBuffer);
  } catch (error) {
    console.error('Speech API Error:', error);
    res.status(500).json({ 
      error: '処理中にエラーが発生しました',
      details: error.message
    });
  }
}
