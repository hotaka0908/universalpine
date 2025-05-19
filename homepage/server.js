// Expressを使用したシンプルなAPIサーバー
const express = require('express');
const { OpenAI } = require('openai');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Expressアプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 8000;

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// JSONボディパーサーの設定
app.use(express.json());

// 静的ファイルの提供
app.use(express.static(__dirname));

// チャットAPIエンドポイント
app.post('/api/chat', async (req, res) => {
  try {
    const { text } = req.body;
    
    // テキストが提供されていない場合は早期リターン
    if (!text || text === 'ping') {
      return res.status(200).json({ text: 'APIサーバーは正常に動作しています' });
    }

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
});

// 音声合成APIエンドポイント
app.post('/api/speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    // テキストが提供されていない場合は早期リターン
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Text-to-Speech APIを使用して音声を生成
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    // 音声データを取得
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // 音声データを返す
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// 音声認識APIエンドポイント
app.post('/api/voice', async (req, res) => {
  try {
    // formidableを使用してマルチパートフォームデータを解析
    const form = new formidable.IncomingForm();
    
    // フォームデータを解析
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // 音声ファイルが提供されていない場合は早期リターン
    if (!files.audio) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // ファイルデータを読み込む
    const fileBuffer = fs.readFileSync(files.audio.filepath);

    // 音声認識APIを使用してテキストに変換
    const transcription = await openai.audio.transcriptions.create({
      file: {
        data: fileBuffer,
        name: 'audio.webm',
        type: 'audio/webm',
      },
      model: 'whisper-1',
      language: 'ja',
    });

    // 認識結果を返す
    return res.status(200).json({ text: transcription.text });
  } catch (error) {
    console.error('Voice API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
