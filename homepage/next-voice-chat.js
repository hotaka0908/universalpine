// OpenAI音声APIを使用した高度な音声チャット機能

// APIサーバーのURL設定
const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const micButton = document.getElementById('mic-button');
    const statusText = document.getElementById('status-text');
    const chatHistory = document.getElementById('chat-history');
    const clearButton = document.getElementById('clear-button');
    const textModeButton = document.getElementById('text-mode-button');
    
    // 録音関連の変数
    let mediaRecorder;
    let audioChunks = [];
    
    // APIキーの取得 (サーバー側で環境変数から取得するのでクライアント側では不要)
    const apiKey = typeof window.config !== 'undefined' ? window.config.apiKey : '';
    
    // APIサーバーの生存確認
    fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: 'ping' })
    }).catch(error => {
        console.warn('APIサーバーに接続できません。サーバーが起動しているか確認してください。');
        statusText.textContent = 'APIサーバーに接続できません';
        micButton.disabled = true;
    });
    
    // マイクボタンのクリックイベント
    micButton.addEventListener('mousedown', startRecording);
    micButton.addEventListener('mouseup', stopRecording);
    micButton.addEventListener('touchstart', startRecording);
    micButton.addEventListener('touchend', stopRecording);
    
    // 録音開始
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.start();
            micButton.classList.add('listening');
            statusText.textContent = 'お話しください...';
            statusText.classList.add('listening');
            
        } catch (error) {
            console.error('マイクへのアクセスエラー:', error);
            statusText.textContent = 'マイクへのアクセスが許可されていません';
        }
    }
    
    // 録音停止と処理
    async function stopRecording() {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
        
        mediaRecorder.stop();
        micButton.classList.remove('listening');
        statusText.classList.remove('listening');
        micButton.classList.add('processing');
        statusText.textContent = 'お答えを考えています...';
        statusText.classList.add('processing');
        
        mediaRecorder.onstop = async () => {
            try {
                // 録音データをBlobに変換
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];
                
                // ユーザーの発言をチャット履歴に追加
                addMessage('音声を処理中...', true);
                
                // FormDataの作成
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice.webm');
                
                try {
                    // 音声をテキストに変換 (Whisper API)
                    const transcribeResponse = await fetch(`${API_BASE_URL}/api/transcribe`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!transcribeResponse.ok) {
                        throw new Error(`Transcription error: ${transcribeResponse.status}`);
                    }
                    
                    const transcribeData = await transcribeResponse.json();
                    const userText = transcribeData.text;
                    
                    // ユーザーの発言を更新
                    updateUserMessage(userText);
                    
                    // チャット応答を取得 (Chat API)
                    const chatResponse = await fetch(`${API_BASE_URL}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: userText })
                    });
                    
                    if (!chatResponse.ok) {
                        throw new Error(`Chat error: ${chatResponse.status}`);
                    }
                    
                    const chatData = await chatResponse.json();
                    const assistantText = chatData.text;
                    
                    // アシスタントの応答を表示
                    addMessage(assistantText, false);
                    
                    // 音声合成 (TTS API)
                    const speechResponse = await fetch(`${API_BASE_URL}/api/speech`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: assistantText })
                    });
                    
                    if (!speechResponse.ok) {
                        throw new Error(`Speech error: ${speechResponse.status}`);
                    }
                    
                    // 音声を再生
                    const audioBlob = await speechResponse.blob();
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    audio.play();
                    
                    // 音声再生終了時の処理
                    audio.onended = () => {
                        micButton.classList.remove('processing');
                        statusText.classList.remove('processing');
                        statusText.textContent = 'お話しませんか？';
                    };
                    
                } catch (apiError) {
                    console.error('APIエラー:', apiError);
                    
                    // APIエラー時のフォールバック処理
                    const fallbackResponses = [
                        "こんにちは、Universal Pineのアシスタントです。何かお手伝いできることはありますか？",
                        "AIネックレスは日常の大切な瞬間を自動的に記録する製品です。詳細を知りたいですか？",
                        "お問い合わせありがとうございます。具体的な内容をお聞かせいただけますか？",
                        "Universal Pineは最先端のAI技術を活用した製品開発を行っています。"
                    ];
                    
                    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                    const aiResponse = fallbackResponses[randomIndex];
                    
                    // チャット履歴を更新
                    updateUserMessage('音声認識完了');
                    addMessage(aiResponse, false);
                    
                    // 音声合成（Web Speech API使用）
                    speakText(aiResponse);
                    
                    // 状態をリセット
                    micButton.classList.remove('processing');
                    statusText.classList.remove('processing');
                    statusText.textContent = 'お話しませんか？';
                }
                
            } catch (error) {
                console.error('音声処理エラー:', error);
                statusText.textContent = 'エラーが発生しました。もう一度お試しください。';
                micButton.classList.remove('processing');
                statusText.classList.remove('processing');
            }
        };
    }
    
    // チャット履歴にメッセージを追加
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // ユーザーメッセージを更新（音声認識結果が出た場合）
    function updateUserMessage(text) {
        const lastMessage = chatHistory.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('user-message')) {
            const messageContent = lastMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.textContent = text;
            }
        }
    }
    
    // テキストを音声で読み上げる関数（Web Speech API使用）
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 日本語の音声を優先的に選択
            const voices = synth.getVoices();
            for (let voice of voices) {
                if (voice.lang === 'ja-JP') {
                    utterance.voice = voice;
                    break;
                }
            }
            
            utterance.lang = 'ja-JP';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            synth.speak(utterance);
        }
    }
    
    // 履歴クリアボタンのイベント
    clearButton.addEventListener('click', () => {
        chatHistory.innerHTML = '';
    });
    
    // テキスト入力モードボタンのイベント
    textModeButton.addEventListener('click', () => {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'text-input';
        textInput.placeholder = 'メッセージを入力...';
        
        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.textContent = '送信';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = '音声モードに戻る';
        
        const textInputContainer = document.createElement('div');
        textInputContainer.className = 'text-input-container';
        textInputContainer.appendChild(textInput);
        textInputContainer.appendChild(sendButton);
        textInputContainer.appendChild(cancelButton);
        
        // 既存のコントロールを一時的に非表示
        const controls = document.querySelector('.controls');
        controls.style.display = 'none';
        
        // テキスト入力コンテナを追加
        const voiceChatContainer = document.getElementById('voice-chat-widget');
        voiceChatContainer.appendChild(textInputContainer);
        
        // テキスト入力にフォーカス
        textInput.focus();
        
        // 送信ボタンのクリックイベント
        sendButton.addEventListener('click', async () => {
            const userInput = textInput.value.trim();
            if (userInput) {
                addMessage(userInput, true);
                textInput.value = '';
                
                // 処理中の表示
                statusText.textContent = 'お答えを考えています...';
                statusText.classList.add('processing');
                
                try {
                    // チャット応答を取得 (Chat API)
                    const chatResponse = await fetch(`${API_BASE_URL}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: userInput })
                    });
                    
                    if (!chatResponse.ok) {
                        throw new Error(`Chat error: ${chatResponse.status}`);
                    }
                    
                    const chatData = await chatResponse.json();
                    const assistantText = chatData.text;
                    
                    // アシスタントの応答を表示
                    addMessage(assistantText, false);
                    
                    // 音声合成 (TTS API)
                    const speechResponse = await fetch(`${API_BASE_URL}/api/speech`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: assistantText })
                    });
                    
                    if (!speechResponse.ok) {
                        throw new Error(`Speech error: ${speechResponse.status}`);
                    }
                    
                    // 音声を再生
                    const audioBlob = await speechResponse.blob();
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    audio.play();
                    
                    // 音声再生終了時の処理
                    audio.onended = () => {
                        statusText.classList.remove('processing');
                        statusText.textContent = 'お話しませんか？';
                    };
                    
                } catch (error) {
                    console.error('APIエラー:', error);
                    
                    // APIエラー時のフォールバック処理
                    const fallbackResponses = [
                        "こんにちは、Universal Pineのアシスタントです。何かお手伝いできることはありますか？",
                        "AIネックレスは日常の大切な瞬間を自動的に記録する製品です。詳細を知りたいですか？",
                        "お問い合わせありがとうございます。具体的な内容をお聞かせいただけますか？",
                        "Universal Pineは最先端のAI技術を活用した製品開発を行っています。"
                    ];
                    
                    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                    const aiResponse = fallbackResponses[randomIndex];
                    
                    // チャット履歴を更新
                    addMessage(aiResponse, false);
                    
                    // 音声合成（Web Speech API使用）
                    speakText(aiResponse);
                    
                    // 状態をリセット
                    statusText.classList.remove('processing');
                    statusText.textContent = 'お話しませんか？';
                }
                
                // テキスト入力コンテナを削除し、元のコントロールを表示
                voiceChatContainer.removeChild(textInputContainer);
                controls.style.display = 'flex';
            }
        });
        
        // キャンセルボタンのクリックイベント
        cancelButton.addEventListener('click', () => {
            voiceChatContainer.removeChild(textInputContainer);
            controls.style.display = 'flex';
        });
        
        // Enterキーでも送信
        textInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendButton.click();
            }
        });
    });
});
