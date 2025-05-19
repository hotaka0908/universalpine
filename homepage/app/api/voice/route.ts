import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータを処理
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }
    
    // ファイルを一時ディレクトリに保存
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 一時ファイルパスを生成
    const tempFilePath = join(tmpdir(), `audio-${Date.now()}.webm`);
    await writeFile(tempFilePath, buffer);
    
    // 音声認識APIを使用してテキストに変換
    const transcription = await openai.audio.transcriptions.create({
      file: {
        data: buffer,
        name: 'audio.webm',
        type: 'audio/webm',
      },
      model: 'whisper-1',
      language: 'ja',
    });
    
    // 認識結果を返す
    return NextResponse.json({ text: transcription.text }, { status: 200 });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
