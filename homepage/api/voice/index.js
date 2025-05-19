// OpenAI APIu3092u4f7fu7528u3057u305fu97f3u58f0u8a8du8b58u30a8u30f3u30c9u30ddu30a4u30f3u30c8
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';
import { promisify } from 'util';

// formidableu306eu30c7u30d5u30a9u30ebu30c8u8a2du5b9au3092u4e0au66f8u304du3057u3066u3001u30d5u30a1u30a4u30ebu3092u30c7u30a3u30b9u30afu306bu4fddu5b58u305bu305au306bu30e1u30e2u30eau306bu4fddu6301
export const config = {
  api: {
    bodyParser: false,
  },
};

// u30d5u30a1u30a4u30ebu8aadu307fu8fbcu307fu3092u975eu540cu671fu5316
const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
  // POSTu30eau30afu30a8u30b9u30c8u306eu307fu3092u8a31u53ef
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // formidableu3092u4f7fu7528u3057u3066u30deu30ebu30c1u30d1u30fcu30c8u30d5u30a9u30fcu30e0u30c7u30fcu30bfu3092u89e3u6790
    const form = formidable({
      keepExtensions: true,
      multiples: false,
      // u30d5u30a1u30a4u30ebu3092u30c7u30a3u30b9u30afu306bu4fddu5b58u305bu305au306bu30e1u30e2u30eau306bu4fddu6301
      fileWriteStreamHandler: () => {
        const chunks = [];
        return {
          write: (chunk) => {
            chunks.push(chunk);
            return true;
          },
          end: () => {},
          destroy: () => {},
          chunks,
        };
      },
    });

    // u30d5u30a9u30fcu30e0u30c7u30fcu30bfu3092u89e3u6790
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // u97f3u58f0u30d5u30a1u30a4u30ebu304cu63d0u4f9bu3055u308cu3066u3044u306au3044u5834u5408u306fu65e9u671fu30eau30bfu30fcu30f3
    if (!files.audio) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // u30d5u30a1u30a4u30ebu30c7u30fcu30bfu3092u30d0u30c3u30d5u30a1u306bu5909u63db
    const fileWriteStreamHandler = files.audio.toJSON().filepath;
    const chunks = form.options.fileWriteStreamHandler().chunks;
    const buffer = Buffer.concat(chunks);

    // OpenAI APIu30afu30e9u30a4u30a2u30f3u30c8u306eu521du671fu5316
    const openai = new OpenAI({
      apiKey: process.env.openai_key
    });

    // u97f3u58f0u8a8du8b58APIu3092u4f7fu7528u3057u3066u30c6u30adu30b9u30c8u306bu5909u63db
    const transcription = await openai.audio.transcriptions.create({
      file: {
        data: buffer,
        name: 'audio.webm',
        type: 'audio/webm',
      },
      model: 'whisper-1',
      language: 'ja',
    });

    // u8a8du8b58u7d50u679cu3092u8fd4u3059
    return res.status(200).json({ text: transcription.text });
  } catch (error) {
    console.error('Voice API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
