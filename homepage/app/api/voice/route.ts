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
    const requestFormData = await request.formData();
    const audioFile = requestFormData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }
    
    // ファイルを一時ディレクトリに保存
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 一時ファイルパスを生成
    const tempFilePath = join(tmpdir(), `audio-${Date.now()}.webm`);
    await writeFile(tempFilePath, buffer);
    
    // 一時ファイルから音声認識を実行
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja');
    
    // OpenAI APIにリクエストを送信
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.webm', { type: 'audio/webm' }),
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

// Next.js 14以降の新しい設定宣言方法
// リクエスト本文をパースしないように設定
export const dynamic = 'force-dynamic';
