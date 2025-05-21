import { Configuration, OpenAIApi } from 'openai';

// OpenAI APIキーの設定（Vercelの環境変数から取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured.');
      return res.status(500).json({ error: 'API key not configured on server.' });
    }

    try {
      console.log('Received text for speech API:', text);
      // OpenAI Text-to-Speech APIへのリクエスト
      const mp3Response = await openai.createSpeech({
        model: 'tts-1', // または 'tts-1-hd' など、利用可能なモデル
        voice: 'alloy', // 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer' から選択
        input: text,
      });

      // バイナリデータとしてレスポンスを返す
      const audioBuffer = await mp3Response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error('Error calling OpenAI Speech API:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  } else {
    // POST以外のメソッドは許可しない
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
