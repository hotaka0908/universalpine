import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universal Pine',
  description: '最先端のAI技術で、人々の生活をより豊かに',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
