import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#9DD941' }}>Universal Pine API Server</h1>
      <p>このサーバーはUniversal Pineの音声チャット機能のためのAPIを提供しています。</p>
      
      <h2>利用可能なエンドポイント</h2>
      <ul>
        <li><code>/api/chat</code> - テキストチャットAPI</li>
        <li><code>/api/voice</code> - 音声認識・応答API</li>
        <li><code>/api/speech</code> - 音声合成API</li>
      </ul>
      
      <p>詳細については、開発者ドキュメントを参照してください。</p>
    </div>
  );
}
