import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Readable } from "stream";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  // u30eau30afu30a8u30b9u30c8u304bu3089u30c6u30adu30b9u30c8u3092u53d6u5f97
  const { text } = await req.json();

  // TTSu751fu6210
  const speechResp = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "alloy",
    input: text,
    format: "wav"
  });

  // u97f3u58f0u30c7u30fcu30bfu3092u8fd4u3059
  return new Response(speechResp as unknown as Readable, {
    headers: { "Content-Type": "audio/wav" }
  });
}
