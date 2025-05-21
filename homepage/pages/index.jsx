import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function HomePage() {
  // 音声チャット関連の状態
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [statusText, setStatusText] = useState('接続中...');
  const [isTextMode, setIsTextMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatHistoryRef = useRef(null);

  // マイクボタンのクリックイベントハンドラ
  const handleMicButtonClick = () => {
    console.log('マイクボタンがクリックされました');
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 履歴クリアボタンのクリックイベントハンドラ
  const handleClearButtonClick = () => {
    console.log('履歴クリアボタンがクリックされました');
    if (chatHistoryRef.current) {
      chatHistoryRef.current.innerHTML = '';
    }
    setMessages([]);
  };

  // テキスト入力モードボタンのクリックイベントハンドラ
  const handleTextModeButtonClick = () => {
    console.log('テキスト入力モードボタンがクリックされました');
    setIsTextMode(true);
  };

  // テキストメッセージ送信ハンドラ
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    console.log('テキストメッセージを送信します:', userInput);
    const messageText = userInput.trim();
    
    // ユーザーのメッセージを表示
    addMessageToChat('user', messageText);
    setUserInput('');
    
    try {
      // チャットAPIへのリクエスト
      setStatusText('お答えを考えています...');
      const API_URL = getApiBaseUrl();
      const chatResponse = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: messageText })
      });
      
      if (!chatResponse.ok) {
        throw new Error(`Chat API error: ${chatResponse.status}`);
      }
      
      const chatData = await chatResponse.json();
      const assistantText = chatData.text;
      
      // アシスタントの応答を表示
      addMessageToChat('assistant', assistantText);
      
      // 音声合成API（TTS）へのリクエスト
      const speechResponse = await fetch(`${API_URL}/api/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: assistantText })
      });
      
      if (!speechResponse.ok) {
        throw new Error(`Speech API error: ${speechResponse.status}`);
      }
      
      // 音声を再生
      const audioBlob = await speechResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
      
      // 音声再生終了時の処理
      audio.onended = () => {
        setStatusText('お話しませんか？');
      };
      
    } catch (error) {
      console.error('APIエラー:', error);
      setStatusText('エラーが発生しました');
      addMessageToChat('system', `エラーが発生しました: ${error.message}`);
    }
    
    // テキスト入力モードを終了
    setIsTextMode(false);
  };

  // 録音開始関数
  const startRecording = async () => {
    try {
      console.log('録音を開始します');
      setStatusText('録音中...');
      setIsRecording(true);
      
      // マイクへのアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('録音が停止しました');
        setIsRecording(false);
        setStatusText('音声を処理中...');
        
        // 録音データを処理
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        try {
          // 音声認識API（Whisper）へのリクエスト
          const API_URL = getApiBaseUrl();
          const voiceResponse = await fetch(`${API_URL}/api/voice`, {
            method: 'POST',
            body: formData
          });
          
          if (!voiceResponse.ok) {
            throw new Error(`Voice API error: ${voiceResponse.status}`);
          }
          
          const voiceData = await voiceResponse.json();
          const recognizedText = voiceData.text;
          console.log('認識されたテキスト:', recognizedText);
          
          // ユーザーのメッセージを表示
          addMessageToChat('user', recognizedText);
          
          // チャットAPIへのリクエスト
          setStatusText('お答えを考えています...');
          const chatResponse = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: recognizedText })
          });
          
          if (!chatResponse.ok) {
            throw new Error(`Chat API error: ${chatResponse.status}`);
          }
          
          const chatData = await chatResponse.json();
          const assistantText = chatData.text;
          
          // アシスタントの応答を表示
          addMessageToChat('assistant', assistantText);
          
          // 音声合成API（TTS）へのリクエスト
          const speechResponse = await fetch(`${API_URL}/api/speech`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: assistantText })
          });
          
          if (!speechResponse.ok) {
            throw new Error(`Speech API error: ${speechResponse.status}`);
          }
          
          // 音声を再生
          const audioBlob = await speechResponse.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.play();
          
          // 音声再生終了時の処理
          audio.onended = () => {
            setStatusText('お話しませんか？');
          };
          
        } catch (error) {
          console.error('APIエラー:', error);
          setStatusText('エラーが発生しました');
          addMessageToChat('system', `エラーが発生しました: ${error.message}`);
        }
      };
      
      mediaRecorder.start();
    } catch (error) {
      console.error('録音開始エラー:', error);
      setIsRecording(false);
      setStatusText('マイクへのアクセスが拒否されました');
      addMessageToChat('system', 'マイクへのアクセスが拒否されました。設定を確認してください。');
    }
  };

  // 録音停止関数
  const stopRecording = () => {
    console.log('録音を停止します');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // チャット履歴にメッセージを追加する関数
  const addMessageToChat = (role, text) => {
    const newMessage = { role, text };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // 最新のメッセージが見えるようにスクロール（useEffectで処理）
  };

  // メッセージが追加されたらスクロールする
  useEffect(() => {
    if (chatHistoryRef.current && messages.length > 0) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  // APIのベースURLを取得する関数
  const getApiBaseUrl = () => {
    const host = window.location.host;
    if (host.includes('localhost')) {
      // 開発サーバーのポート番号を取得
      const port = window.location.port || '3000';
      return `http://localhost:${port}`;
    }
    return '';
  };

  useEffect(() => {
    // 初期化処理
    console.log('Voice Chat Widget initialized');
    
    // 初期ステータスを設定
    setStatusText('お話しませんか？');
    
    // クリーンアップ処理
    return () => {
      // ページアンロード時に録音を停止
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Universal Pine - 人とAIを繋げる</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Universal Pine - 人とAIを繋げる" />
      </Head>

      <main>
        <h1>Universal Pine</h1>
        <p>人とAIを繋げる</p>
        
        {/* 音声チャットウィジェット */}
        <div id="voice-chat-widget">
          <div id="chat-history" ref={chatHistoryRef}>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-icon">
                  {message.role === 'user' ? '👤' : message.role === 'assistant' ? '🤖' : 'ℹ️'}
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
          </div>
          
          {!isTextMode ? (
            <div className="controls">
              <button 
                id="mic-button" 
                className={isRecording ? 'recording mic-button' : 'mic-button'}
                onClick={handleMicButtonClick}
              >
                {isRecording ? '停止' : '話す'}
              </button>
              <div id="status-text">{statusText}</div>
              <div className="buttons">
                <button id="clear-button" onClick={handleClearButtonClick}>履歴クリア</button>
                <button id="text-mode-button" onClick={handleTextModeButtonClick}>テキスト入力</button>
              </div>
            </div>
          ) : (
            <div className="text-input-container">
              <input 
                type="text" 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="メッセージを入力..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <div className="button-container">
                <button onClick={handleSendMessage}>送信</button>
                <button onClick={() => setIsTextMode(false)}>キャンセル</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* スタイルを適用 */}
      <style jsx>{`
        #voice-chat-widget {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        #chat-history {
          height: 300px;
          overflow-y: auto;
          padding: 10px;
          margin-bottom: 10px;
          background-color: white;
          border: 1px solid #eee;
          border-radius: 5px;
        }
        
        .message {
          display: flex;
          margin-bottom: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .message.user {
          background-color: rgba(157, 217, 65, 0.1);
          align-self: flex-end;
        }
        
        .message.assistant {
          background-color: rgba(0, 93, 255, 0.05);
          align-self: flex-start;
        }
        
        .message.system {
          background-color: rgba(255, 87, 34, 0.05);
          color: #ff5722;
          font-style: italic;
        }
        
        .message-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .message-text {
          flex-grow: 1;
          word-break: break-word;
        }
        
        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .mic-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #4285f4;
          color: white;
          border: none;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        
        .mic-button:hover {
          transform: scale(1.05);
        }
        
        .mic-button.recording {
          background-color: #ff5722;
          animation: pulse 1.5s infinite;
        }
        
        .buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        button {
          padding: 8px 12px;
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #3367d6;
        }
        
        .text-input-container {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
          width: 100%;
        }
        
        .text-input-container input {
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .button-container {
          display: flex;
          gap: 10px;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* 音声チャット用スクリプト */}
      <Script src="/next-voice-chat.js" strategy="afterInteractive" />
    </div>
  );
}
