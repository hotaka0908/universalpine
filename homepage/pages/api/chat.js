import { Configuration, OpenAIApi } from 'openai';

// OpenAI APIキーの設定（環境変数から取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // 正しい環境変数名を参照
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
      console.log('Received text for chat API:', text);
      // OpenAI Chat APIへのリクエスト
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', // または 'gpt-4' など、利用可能なモデル
        messages: [{ role: 'user', content: text }],
      });

      const aiResponse = completion.data.choices[0].message.content.trim();
      console.log('OpenAI API response:', aiResponse);
      res.status(200).json({ text: aiResponse });
    } catch (error) {
      console.error('Error calling OpenAI Chat API:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  } else {
    // POST以外のメソッドは許可しない
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
