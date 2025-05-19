import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI APIu30afu30e9u30a4u30a2u30f3u30c8u306eu521du671fu5316
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // u30c6u30adu30b9u30c8u304cu63d0u4f9bu3055u308cu3066u3044u306au3044u5834u5408u306fu65e9u671fu30eau30bfu30fcu30f3
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Text-to-Speech APIu3092u4f7fu7528u3057u3066u97f3u58f0u3092u751fu6210
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    // u97f3u58f0u30c7u30fcu30bfu3092u53d6u5f97
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // u97f3u58f0u30c7u30fcu30bfu3092u8fd4u3059
    const response = new NextResponse(buffer);
    response.headers.set('Content-Type', 'audio/mpeg');
    response.headers.set('Content-Length', buffer.length.toString());
    return response;
  } catch (error) {
    console.error('Speech API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}
