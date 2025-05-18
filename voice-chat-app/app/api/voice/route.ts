import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Readable } from "stream";

const openai = new OpenAI({ apiKey: 'openai_key' });

export async function POST(req: NextRequest) {
  // 1) audio 受け取り
  const form = await req.formData();
  const audioFile = form.get("file") as File;

  // 2) 文字起こし
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",               // 日本語OK
    language: "ja"                    // 必要なら明示
  });

  // 3) Chat completion
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",             // お好みで
    messages: [
      { role: "system", content: "あなたはUniversal Pineという会社のAIアシスタントです。日本語で簡潔に応答してください。会社はAI技術を専門とし、AIネックレスという製品を開発しています。AIネックレスは日常の大切な瞬間を自動的に記録し、プライバシーを守りながら思い出を残す製品です。" },
      { role: "user", content: transcription.text }
    ],
    temperature: 0.7
  });
  const assistantText = chat.choices[0].message.content!;

  // 4) TTS 生成
  const speechResp = await openai.audio.speech.create({
    model: "tts-1-hd",                // or gpt-4o-tts
    voice: "alloy",                   // "alloy","nova" など
    input: assistantText
    // formatプロパティは最新のOpenAI SDKではサポートされていない可能性があります
  });

  // speechResp は ReadableStream
  // OpenAI SDK v4 では speechResp は ReadableStream を返すので、そのまま Response に渡す
  return new Response(speechResp.body, {
    headers: { "Content-Type": "audio/wav" }
  });
}
