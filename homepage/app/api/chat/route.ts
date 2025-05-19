import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // テキストが提供されていない場合は早期リターン
    if (!text || text === 'ping') {
      return NextResponse.json({ text: 'APIサーバーは正常に動作しています' }, { status: 200 });
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
    return NextResponse.json({ text: completion.choices[0].message.content }, { status: 200 });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}
