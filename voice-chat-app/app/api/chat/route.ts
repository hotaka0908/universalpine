import { OpenAI } from "openai";
import { NextRequest } from "next/server";

// process.env.openai_keyが存在しない場合はエラーメッセージを表示
// 本番環境では.env.localファイルにopenai_keyを設定する必要があります
if (!process.env.openai_key) {
  console.error('警告: openai_keyが設定されていません。.env.localファイルに設定してください。');
}

const openai = new OpenAI({ 
  apiKey: process.env.openai_key || 'sk-dummy-key' // 実際の環境変数から取得、存在しない場合はダミーキーを使用
});

// CORSヘッダーを設定する関数
function setCorsHeaders(headers: Headers) {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

// OPTIONSリクエストに対応する関数
export async function OPTIONS() {
  const headers = new Headers();
  setCorsHeaders(headers);
  return new Response(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  // リクエストからテキストを取得
  const { text } = await req.json();

  // Chat completion
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "あなたはUniversal Pineという会社のAIアシスタントです。日本語で簡潔に応答してください。会社はAI技術を専門とし、AIネックレスという製品を開発しています。AIネックレスは日常の大切な瞬間を自動的に記録し、プライバシーを守りながら思い出を残す製品です。" },
      { role: "user", content: text }
    ],
    temperature: 0.7
  });
  
  const assistantText = chat.choices[0].message.content!;

  // JSONレスポンスを返す
  const headers = new Headers();
  setCorsHeaders(headers);
  return Response.json({ text: assistantText }, { headers });
}
