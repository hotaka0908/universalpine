import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Readable } from "stream";

const openai = new OpenAI({ apiKey: 'openai_key' });

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
  return new Response(speechResp.body, {
    headers: { "Content-Type": "audio/wav" }
  });
}
