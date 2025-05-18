import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-sans-jp' });

export const metadata: Metadata = {
  title: 'Universal Pine - 音声AIアシスタント',
  description: '人とAIを繋げる - Universal Pineの音声AIアシスタントでリアルタイムに会話',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
