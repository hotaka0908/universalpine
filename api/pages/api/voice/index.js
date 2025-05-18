// Universal Pine AI Voice API
// Next.js API route handler for voice transcription and response

import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import formidable from 'formidable';
import os from 'os';

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

// APIレスポンスサイズを増やすためにbodyParserを無効化
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    
    // リクエストボディからオーディオデータを取得
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // 一時ファイルとしてオーディオを保存
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'audio.webm');
    await fs.promises.writeFile(tempFilePath, buffer);
    
    console.log('Voice API: Audio file saved to', tempFilePath);
    
    // 音声をテキストに変換
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "ja"
    });
    
    console.log('Voice API: Transcription:', transcription.text);
    
    // テキストからAI応答を生成
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "あなたはUniversal PineのAIアシスタントです。" },
        { role: "user", content: transcription.text }
      ],
      temperature: 0.7
    });
    
    const aiResponse = chat.choices[0].message.content;
    console.log('Voice API: AI Response:', aiResponse);
    
    // 音声合成でAI応答を読み上げる
    const speechResp = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input: aiResponse
    });
    
    // 音声データをバッファに変換
    const audioBuffer = await streamToBuffer(speechResp.body);
    console.log('Voice API: Audio buffer size:', audioBuffer.length);
    
    // 一時ファイルを削除
    await fs.promises.unlink(tempFilePath).catch(err => console.error('Failed to delete temp file:', err));
    
    // レスポンスを返す
    res.status(200)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .json({
        transcription: transcription.text,
        response: aiResponse,
        audio: audioBuffer.toString('base64')
      });
  } catch (error) {
    console.error('Voice API Error:', error);
    res.status(500).json({ 
      error: '処理中にエラーが発生しました',
      details: error.message
    });
  }
}
