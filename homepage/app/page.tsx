import { useEffect } from 'react';
import { Metadata } from 'next';

// メタデータの設定
export const metadata: Metadata = {
  title: 'Universal Pine - 人とAIを繋げる',
  description: '最先端のAI技術で、人々の生活をより豊かに',
};

// ホームページコンポーネント
export default function Home() {
  // 既存のHTMLコンテンツをiframeで表示
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe 
        src="/static/index.html" 
        style={{ 
          border: 'none', 
          height: '100%', 
          width: '100%' 
        }}
      />
    </div>
  );
}
