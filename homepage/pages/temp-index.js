import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function HomePage() {
  // u97f3u58f0u30c1u30e3u30c3u30c8u95a2u9023u306eu72b6u614b
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [statusText, setStatusText] = useState('u63a5u7d9au4e2d...');
  const [isTextMode, setIsTextMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    // u521du671fu5316u51e6u7406
    console.log('Voice Chat Widget initialized');
  }, []);

  return (
    <div>
      <Head>
        <title>Universal Pine - u4ebau3068AIu3092u7e4bu3052u308b</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Universal Pine - u4ebau3068AIu3092u7e4bu3052u308b" />
      </Head>

      <main>
        <h1>Universal Pine</h1>
        <p>u4ebau3068AIu3092u7e4bu3052u308b</p>
        
        {/* u97f3u58f0u30c1u30e3u30c3u30c8u30a6u30a3u30b8u30a7u30c3u30c8 */}
        <div id="voice-chat-widget">
          <div id="chat-history" ref={chatHistoryRef}></div>
          <div className="controls">
            <button id="mic-button" className={isRecording ? 'recording' : ''}>
              {isRecording ? 'u505cu6b62' : 'u8a71u3059'}
            </button>
            <div id="status-text">{statusText}</div>
            <div className="buttons">
              <button id="clear-button">u5c65u6b74u30afu30eau30a2</button>
              <button id="text-mode-button">u30c6u30adu30b9u30c8u5165u529b</button>
            </div>
          </div>
        </div>
      </main>

      {/* u97f3u58f0u30c1u30e3u30c3u30c8u7528u30b9u30afu30eau30d7u30c8 */}
      <Script src="/next-voice-chat.js" strategy="afterInteractive" />
    </div>
  );
}
