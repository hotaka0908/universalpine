// OpenAI音声APIを使用した高度な音声チャット機能

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
    
    // APIキーの取得
    const apiKey = typeof window.config !== 'undefined' ? window.config.apiKey : '';
    
    if (!apiKey) {
        console.warn('APIキーが設定されていません。音声チャット機能は動作しません。');
        statusText.textContent = 'APIキーが必要です';
        micButton.disabled = true;
        return;
    }
    
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
                
                // ユーザーの発言をチャット履歴に追加（仮のテキスト）
                addMessage('音声を処理中...', true);
                
                // FormDataの作成
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice.webm');
                formData.append('apiKey', apiKey);
                
                // サーバーサイドの処理が実装されるまでのモック応答
                setTimeout(async () => {
                    // 実際のAPIが実装されるまでのフォールバック
                    const fallbackResponses = [
                        "こんにちは、Universal Pineのアシスタントです。何かお手伝いできることはありますか？",
                        "AIネックレスは日常の大切な瞬間を自動的に記録する製品です。詳細を知りたいですか？",
                        "お問い合わせありがとうございます。具体的な内容をお聞かせいただけますか？",
                        "Universal Pineは最先端のAI技術を活用した製品開発を行っています。"
                    ];
                    
                    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                    const aiResponse = fallbackResponses[randomIndex];
                    
                    // チャット履歴を更新
                    updateUserMessage(aiResponse);
                    addMessage(aiResponse, false);
                    
                    // 音声合成（実際のAPIが実装されるまでのWeb Speech API使用）
                    speakText(aiResponse);
                    
                    // 状態をリセット
                    micButton.classList.remove('processing');
                    statusText.classList.remove('processing');
                    statusText.textContent = 'お話しませんか？';
                }, 2000);
                
                /* 実際のAPIが実装された場合のコード
                // サーバーにリクエスト送信
                const response = await fetch('/api/voice', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                // 音声応答を取得
                const assistantAudio = await response.blob();
                
                // 音声を再生
                const url = URL.createObjectURL(assistantAudio);
                const audio = new Audio(url);
                audio.play();
                
                // チャット履歴を更新
                updateUserMessage('音声認識完了');
                addMessage('(音声再生中...)', false);
                
                // 状態をリセット
                micButton.classList.remove('processing');
                statusText.classList.remove('processing');
                statusText.textContent = 'お話しませんか？';
                */
                
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
        
        const textInputContainer = document.createElement('div');
        textInputContainer.className = 'text-input-container';
        textInputContainer.appendChild(textInput);
        textInputContainer.appendChild(sendButton);
        
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
                
                // サーバーサイドの処理が実装されるまでのモック応答
                setTimeout(async () => {
                    // 実際のAPIが実装されるまでのフォールバック
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
                    
                    // 音声合成（実際のAPIが実装されるまでのWeb Speech API使用）
                    speakText(aiResponse);
                    
                    // 状態をリセット
                    statusText.classList.remove('processing');
                    statusText.textContent = 'お話しませんか？';
                    
                    // テキスト入力コンテナを削除し、元のコントロールを表示
                    voiceChatContainer.removeChild(textInputContainer);
                    controls.style.display = 'flex';
                }, 2000);
            }
        });
        
        // Enterキーでも送信
        textInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendButton.click();
            }
        });
    });
});
