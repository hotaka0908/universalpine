import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Readable } from "stream";

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
  // u30eau30afu30a8u30b9u30c8u304bu3089u30c6u30adu30b9u30c8u3092u53d6u5f97
  const { text } = await req.json();

  // TTSu751fu6210
  const speechResp = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "alloy",
    input: text
    // formatu30d7u30edu30d1u30c6u30a3u306fu6700u65b0u306eOpenAI SDKu3067u306fu30b5u30ddu30fcu30c8u3055u308cu3066u3044u306au3044u53efu80fdu6027u304cu3042u308au307eu3059
  });

  // u97f3u58f0u30c7u30fcu30bfu3092u8fd4u3059
  // OpenAI SDK v4 u3067u306f speechResp u306f ReadableStream u3092u8fd4u3059u306eu3067u3001u305du306eu307eu307e Response u306bu6e21u3059
  const headers = new Headers({ 
    "Content-Type": "audio/wav; charset=utf-8",
    "Content-Disposition": "attachment; filename=\"speech.wav\""
  });
  setCorsHeaders(headers);
  
  return new Response(speechResp.body, { headers });
}
