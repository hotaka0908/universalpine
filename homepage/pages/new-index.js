import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Universal Pine - 人とAIを繋げる</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main>
        <h1>人とAIを繋げる</h1>
        <p>AIアシスタントにお話しかけてみましょう</p>
      </main>
    </div>
  );
}
