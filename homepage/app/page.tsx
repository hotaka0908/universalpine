import React from 'react';
import { Metadata } from 'next';
import styles from './page.module.css';

// メタデータの設定
export const metadata: Metadata = {
  title: 'Universal Pine - 人とAIを繋げる',
  description: '最先端のAI技術で、人々の生活をより豊かに',
};

// ホームページコンポーネント
export default function Home() {
  // 既存のHTMLコンテンツをiframeで表示
  return (
    <div className={styles.container}>
      <iframe 
        src="/static/index.html" 
        className={styles.frame}
        title="Universal Pine Homepage"
      />
    </div>
  );
}
