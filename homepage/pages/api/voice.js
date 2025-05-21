import { Configuration, OpenAIApi } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

// OpenAI APIキーの設定（Vercelの環境変数から取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Next.js API Route の bodyParser を無効にする (formidable が処理するため)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured.');
      return res.status(500).json({ error: 'API key not configured on server.' });
    }

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error processing audio file.' });
      }

      const audioFile = files.file;

      if (!audioFile) {
        return res.status(400).json({ error: 'No audio file received.' });
      }

      try {
        console.log('Received audio file:', audioFile.originalFilename, 'size:', audioFile.size);
        // formidable v2では filepath, formidable v3では filepath
        const filePath = audioFile.filepath || audioFile.path;

        // OpenAI Whisper APIへのリクエスト
        const response = await openai.createTranscription(
          fs.createReadStream(filePath),
          'whisper-1' // Whisperモデル
        );

        const transcribedText = response.data.text;
        console.log('Transcribed text:', transcribedText);
        res.status(200).json({ text: transcribedText });

        // 一時ファイルの削除
        fs.unlink(filePath, unlinkErr => {
          if (unlinkErr) console.error('Error deleting temp audio file:', unlinkErr);
        });

      } catch (error) {
        console.error('Error calling OpenAI Whisper API:', error.response ? error.response.data : error.message);
        // 一時ファイルが残っている可能性があれば削除を試みる
        if (audioFile && (audioFile.filepath || audioFile.path)) {
            const filePath = audioFile.filepath || audioFile.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, unlinkErr => {
                    if (unlinkErr) console.error('Error deleting temp audio file after error:', unlinkErr);
                });
            }
        }
        res.status(500).json({ error: 'Failed to transcribe audio' });
      }
    });
  } else {
    // POST以外のメソッドは許可しない
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
