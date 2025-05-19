// Expressu3092u4f7fu7528u3057u305fu30b7u30f3u30d7u30ebu306aAPIu30b5u30fcu30d0u30fc
const express = require('express');
const { OpenAI } = require('openai');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Expressu30a2u30d7u30eau30b1u30fcu30b7u30e7u30f3u306eu521du671fu5316
const app = express();
const PORT = process.env.PORT || 8000;

// OpenAI APIu30afu30e9u30a4u30a2u30f3u30c8u306eu521du671fu5316
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// JSONu30dcu30c7u30a3u30d1u30fcu30b5u30fcu306eu8a2du5b9a
app.use(express.json());

// u9759u7684u30d5u30a1u30a4u30ebu306eu63d0u4f9b
app.use(express.static(__dirname));

// u30c1u30e3u30c3u30c8APIu30a8u30f3u30c9u30ddu30a4u30f3u30c8
app.post('/api/chat', async (req, res) => {
  try {
    const { text } = req.body;
    
    // u30c6u30adu30b9u30c8u304cu63d0u4f9bu3055u308cu3066u3044u306au3044u5834u5408u306fu65e9u671fu30eau30bfu30fcu30f3
    if (!text || text === 'ping') {
      return res.status(200).json({ text: 'APIu30b5u30fcu30d0u30fcu306fu6b63u5e38u306bu52d5u4f5cu3057u3066u3044u307eu3059' });
    }

    // ChatGPT APIu3092u4f7fu7528u3057u3066u5fdcu7b54u3092u751fu6210
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "u3042u306au305fu306fUniversal Pineu306eu97f3u58f0u30a2u30b7u30b9u30bfu30f3u30c8u3067u3059u3002u7c21u6f54u3067u89aau3057u307fu3084u3059u3044u5fdcu7b54u3092u65e5u672cu8a9eu3067u63d0u4f9bu3057u3066u304fu3060u3055u3044u3002" },
        { role: "user", content: text }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    // u5fdcu7b54u3092u8fd4u3059
    return res.status(200).json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// u97f3u58f0u5408u6210APIu30a8u30f3u30c9u30ddu30a4u30f3u30c8
app.post('/api/speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    // u30c6u30adu30b9u30c8u304cu63d0u4f9bu3055u308cu3066u3044u306au3044u5834u5408u306fu65e9u671fu30eau30bfu30fcu30f3
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
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
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// u97f3u58f0u8a8du8b58APIu30a8u30f3u30c9u30ddu30a4u30f3u30c8
app.post('/api/voice', async (req, res) => {
  try {
    // formidableu3092u4f7fu7528u3057u3066u30deu30ebu30c1u30d1u30fcu30c8u30d5u30a9u30fcu30e0u30c7u30fcu30bfu3092u89e3u6790
    const form = new formidable.IncomingForm();
    
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

    // u30d5u30a1u30a4u30ebu30c7u30fcu30bfu3092u8aadu307fu8fbcu3080
    const fileBuffer = fs.readFileSync(files.audio.filepath);

    // u97f3u58f0u8a8du8b58APIu3092u4f7fu7528u3057u3066u30c6u30adu30b9u30c8u306bu5909u63db
    const transcription = await openai.audio.transcriptions.create({
      file: {
        data: fileBuffer,
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
});

// u30b5u30fcu30d0u30fcu3092u8d77u52d5
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
