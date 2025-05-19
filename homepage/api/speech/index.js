// OpenAI APIu3092u4f7fu7528u3057u305fText-to-Speechu30a8u30f3u30c9u30ddu30a4u30f3u30c8
import OpenAI from 'openai';

export default async function handler(req, res) {
  // POSTu30eau30afu30a8u30b9u30c8u306eu307fu3092u8a31u53ef
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    // u30c6u30adu30b9u30c8u304cu63d0u4f9bu3055u308cu3066u3044u306au3044u5834u5408u306fu65e9u671fu30eau30bfu30fcu30f3
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // OpenAI APIu30afu30e9u30a4u30a2u30f3u30c8u306eu521du671fu5316
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Text-to-Speech APIu3092u4f7fu7528u3057u3066u97f3u58f0u3092u751fu6210
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    // u97f3u58f0u30c7u30fcu30bfu3092u53d6u5f97
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // u97f3u58f0u30c7u30fcu30bfu3092u8fd4u3059
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
