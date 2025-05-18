// OpenAI音声APIを使用した高度な音声チャット機能

// APIサーバーのURL設定 - ローカル開発環境と本番環境の両方で動作するように設定
// 現在のホスト名に基づいてAPIエンドポイントを判断
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost ? 'http://localhost:3002' : 'https://universalpine-voice-chat.windsurf.build';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Voice Chat Widget initialized');
    
    // 要素の取得
    const micButton = document.getElementById('mic-button');
    const statusText = document.getElementById('status-text');
    const chatHistory = document.getElementById('chat-history');
    const clearButton = document.getElementById('clear-button');
    const textModeButton = document.getElementById('text-mode-button');
    const voiceChatContainer = document.getElementById('voice-chat-widget');
    
    if (!micButton || !statusText || !chatHistory || !clearButton || !textModeButton || !voiceChatContainer) {
        console.error('必要なDOM要素が見つかりません。');
        return;
    }
    
    // 録音関連の変数
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    
    // APIサーバーの生存確認
    console.log(`APIサーバーに接続しています: ${API_BASE_URL}/api/chat`);
    fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: 'ping' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('APIサーバーに接続できました');
        statusText.textContent = 'お話しませんか？';
        return response.json();
    })
    .catch(error => {
        console.warn('APIサーバーに接続できません。エラー: ', error);
        statusText.textContent = 'APIサーバーに接続できません';
        micButton.disabled = true;
    });
    
    // マイクボタンのクリックイベント
    micButton.addEventListener('click', () => {
        console.log('マイクボタンがクリックされました');
        
        if (isRecording) {
            stopRecording();
            return;
        }
        
        startRecording();
    });
    
    // 録音開始関数
    function startRecording() {
        console.log('録音開始関数が呼び出されました');
        
        // マイクへのアクセスを要求
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                console.log('マイクの権限が許可されました');
                statusText.textContent = '録音中...';
                micButton.classList.add('recording');
                isRecording = true;
                
                // MediaRecorderの初期化
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                // データが利用可能になったときのイベント
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        console.log('音声データが利用可能になりました');
                        audioChunks.push(event.data);
                    }
                };
                
                // 録音終了時のイベント
                mediaRecorder.onstop = () => {
                    console.log('録音が終了しました');
                    isRecording = false;
                    
                    // 音声データをBlobに変換
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    console.log('音声Blobを作成しました', audioBlob.size + ' bytes');
                    
                    // FormDataの作成
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');
                    
                    // ユーザーの発言を表示
                    addMessageToChat('user', '音声を処理中...');
                    
                    // APIリクエストの送信
                    console.log(`APIリクエストを送信します: ${API_BASE_URL}/api/voice`);
                    fetch(`${API_BASE_URL}/api/voice`, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        console.log('APIレスポンスを受信しました', response.status);
                        if (!response.ok) {
                            throw new Error(`APIリクエストが失敗しました: ${response.status}`);
                        }
                        return response.blob();
                    })
                    .then(audioBlob => {
                        console.log('音声レスポンスを受信しました', audioBlob.size + ' bytes');
                        // 音声レスポンスを再生
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        audio.play();
                        
                        // テキストレスポンスを取得
                        return fetch(`${API_BASE_URL}/api/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ text: '最新の応答をテキストで取得' })
                        });
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('テキストレスポンスを受信しました', data);
                        // レスポンスを表示
                        addMessageToChat('assistant', data.text);
                        statusText.textContent = 'お話しませんか？';
                    })
                    .catch(error => {
                        console.error('エラーが発生しました:', error);
                        statusText.textContent = 'エラーが発生しました';
                        addMessageToChat('system', `エラー: ${error.message}`);
                    });
                    
                    // ストリームの停止
                    stream.getTracks().forEach(track => track.stop());
                };
                
                // 録音開始
                console.log('録音を開始します');
                mediaRecorder.start();
                
                // 10秒後に自動停止するタイマーを設定
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        console.log('10秒経過したため録音を自動停止します');
                        stopRecording();
                    }
                }, 10000);
            })
            .catch(error => {
                console.error('マイクへのアクセスが拒否されました:', error);
                statusText.textContent = 'マイクへのアクセスが必要です';
                addMessageToChat('system', 'マイクへのアクセスを許可してください');
            });
    }
    
    // 録音停止関数
    function stopRecording() {
        console.log('録音停止関数が呼び出されました');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            statusText.textContent = '処理中...';
            micButton.classList.remove('recording');
            mediaRecorder.stop();
        }
    }
    
    // チャット履歴にメッセージを追加する関数
    function addMessageToChat(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'user-message' : (role === 'assistant' ? 'ai-message' : 'system-message');
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // 履歴クリアボタンのイベント
    clearButton.addEventListener('click', () => {
        console.log('履歴クリアボタンがクリックされました');
        chatHistory.innerHTML = '';
    });
    
    // テキスト入力モードボタンのイベント
    textModeButton.addEventListener('click', () => {
        console.log('テキスト入力モードボタンがクリックされました');
        
        // マイクボタンとステータステキストを非表示にする
        const controls = document.querySelector('.controls');
        controls.style.display = 'none';
        
        // テキスト入力コンテナを作成
        const textInputContainer = document.createElement('div');
        textInputContainer.className = 'text-input-container';
        
        // テキスト入力フィールドを作成
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'text-input';
        textInput.placeholder = 'メッセージを入力...';
        
        // 送信ボタンを作成
        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.textContent = '送信';
        
        // キャンセルボタンを作成
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'キャンセル';
        
        // ボタンコンテナを作成
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(sendButton);
        buttonContainer.appendChild(cancelButton);
        
        // テキスト入力コンテナに要素を追加
        textInputContainer.appendChild(textInput);
        textInputContainer.appendChild(buttonContainer);
        
        // チャットウィジェットにテキスト入力コンテナを追加
        voiceChatContainer.appendChild(textInputContainer);
        
        // テキスト入力にフォーカス
        textInput.focus();
        
        // 送信ボタンのクリックイベント
        sendButton.addEventListener('click', async () => {
            const userInput = textInput.value.trim();
            
            if (userInput) {
                addMessageToChat('user', userInput);
                textInput.value = '';
                
                // 処理中の表示
                statusText.textContent = 'お答えを考えています...';
                
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
                    addMessageToChat('assistant', assistantText);
                    
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
                        statusText.textContent = 'お話しませんか？';
                    };
                    
                } catch (error) {
                    console.error('APIエラー:', error);
                    statusText.textContent = 'エラーが発生しました';
                    addMessageToChat('system', `エラー: ${error.message}`);
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
