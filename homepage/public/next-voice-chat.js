// OpenAI音声APIを使用した高度な音声チャット機能

// APIサーバーのURL設定 - 同一オリジンのAPIを使用
// 同一オリジンのAPIエンドポイントを使用することでCSPとCORSの問題を解決
// Next.js Pages RouterのAPIルートを使用するため、ルートからの相対パスで指定
const API_BASE_URL = '';

// ブラウザのURLからAPIのベースURLを自動検出
// 開発環境とプロダクション環境のどちらでも動作するように設定
const getApiBaseUrl = () => {
    // 現在のホスト（localhost:3000やuniversalpine.comなど）を取得
    const host = window.location.host;
    // 開発環境（localhost）の場合
    if (host.includes('localhost')) {
        return 'http://localhost:3000';
    }
    // その他の環境（本番環境など）の場合は空文字を返す（同一オリジンのAPIを使用）
    return '';
};

// APIのベースURLを設定
const API_URL = getApiBaseUrl();


document.addEventListener('DOMContentLoaded', () => {
    console.log('Voice Chat Widget initialized - OpenAI API version');
    
    // 要素の取得
    const micButton = document.getElementById('mic-button');
    const statusText = document.getElementById('status-text');
    const chatHistory = document.getElementById('chat-history');
    const clearButton = document.getElementById('clear-button');
    const textModeButton = document.getElementById('text-mode-button');
    const voiceChatContainer = document.getElementById('voice-chat-widget');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/hero-voice-chat.css';
    document.head.appendChild(link);
    
    const style = document.createElement('style');
    style.innerHTML = `
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
        
        .message.user .message-icon {
            color: #9DD941;
        }
        
        .message.assistant .message-icon {
            color: #005DFF;
        }
        
        .message.system .message-icon {
            color: #ff5722;
        }
        
        .message-text {
            flex-grow: 1;
            word-break: break-word;
        }
        
        .highlight {
            animation: highlight 1s ease-in-out;
        }
        
        @keyframes highlight {
            0% { background-color: rgba(255, 255, 100, 0.3); }
            100% { background-color: inherit; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .voice-chat-container {
            transition: all 0.3s ease;
        }
        
        .mic-button {
            transition: all 0.2s ease;
        }
        
        .mic-button:hover {
            transform: scale(1.05);
        }
        
        .mic-button.recording {
            animation: pulse 1.5s infinite;
            background-color: #ff5722;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
        }
    `;
    document.head.appendChild(style);
    
    if (!micButton || !statusText || !chatHistory || !clearButton || !textModeButton || !voiceChatContainer) {
        console.error('必要なDOM要素が見つかりません。');
        return;
    }
    
    // 録音関連の変数
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    
    // APIサーバーの生存確認
    console.log(`APIサーバーに接続しています: ${API_URL}/api/chat`);
    fetch(`${API_URL}/api/chat`, {
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
        addMessageToChat('system', 'APIサーバーに接続できません。インターネット接続を確認するか、しばらく経ってからお試しください。');
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
                    console.log('音声Blobを作成しました', `${audioBlob.size} bytes`);
                    
                    // FormDataの作成
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');
                    
                    // ユーザーの発言を表示
                    addMessageToChat('user', '音声を処理中...');
                    
                    // APIリクエストの送信
                    console.log(`APIリクエストを送信します: ${API_URL}/api/voice`);
                    fetch(`${API_URL}/api/voice`, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        console.log('APIレスポンスを受信しました', response.status);
                        if (!response.ok) {
                            throw new Error(`APIリクエストが失敗しました: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('音声認識結果を受信しました:', data.text);
                        
                        // 認識されたテキストをチャット履歴に表示（仮表示の「音声を処理中...」を削除して置き換え）
                        const chatHistoryElements = chatHistory.querySelectorAll('.message');
                        for (let i = chatHistoryElements.length - 1; i >= 0; i--) {
                            if (chatHistoryElements[i].classList.contains('user')) {
                                // テキストを更新
                                chatHistoryElements[i].querySelector('.message-text').textContent = data.text;
                                // 視覚的フィードバックのために一時的にハイライト効果を追加
                                chatHistoryElements[i].classList.add('highlight');
                                setTimeout(() => {
                                    chatHistoryElements[i].classList.remove('highlight');
                                }, 1000);
                                break;
                            }
                        }
                        
                        // 認識されたテキストを使ってチャットAPIにリクエスト
                        return fetch(`${API_URL}/api/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ text: data.text })
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
                        // よりユーザーフレンドリーなエラーメッセージを表示
                        if (error.message.includes('API')) {
                            addMessageToChat('system', 'APIサーバーとの通信中にエラーが発生しました。インターネット接続を確認してください。');
                        } else if (error.message.includes('network') || error.message.includes('fetch')) {
                            addMessageToChat('system', 'ネットワークエラーが発生しました。インターネット接続を確認してください。');
                        } else {
                            addMessageToChat('system', `エラーが発生しました: ${error.message}`);
                        }
                    });
                    
                    // ストリームの停止
                    stream.getTracks().forEach(track => track.stop());
                };
                
                // 録音開始
                console.log('録音を開始します');
                mediaRecorder.start();
                
                // 音声検出と自動停止のための設定
                const MAX_RECORDING_TIME = 20000; // 最大録音時間を20秒に延長
                let silenceTimer = null;
                let audioContext = null;
                let analyser = null;
                let micStream = null;
                let dataArray = null;
                
                // 無音検出のためのセットアップ
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    micStream = audioContext.createMediaStreamSource(stream);
                    micStream.connect(analyser);
                    analyser.fftSize = 256;
                    const bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    
                    // 音量を定期的にチェック
                    const checkSilence = () => {
                        if (!isRecording) return;
                        
                        analyser.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for (let i = 0; i < dataArray.length; i++) {
                            sum += dataArray[i];
                        }
                        const average = sum / dataArray.length;
                        
                        // 音量が一定のしきい値を下回ったら無音と判断
                        if (average < 10) { // しきい値は必要に応じて調整
                            if (!silenceTimer) {
                                silenceTimer = setTimeout(() => {
                                    console.log('無音を検出したため録音を停止します');
                                    stopRecording();
                                }, 1500); // 1.5秒の無音で停止
                            }
                        } else {
                            // 音が検出されたらタイマーをリセット
                            if (silenceTimer) {
                                clearTimeout(silenceTimer);
                                silenceTimer = null;
                            }
                        }
                        
                        // 次のフレームでも確認
                        requestAnimationFrame(checkSilence);
                    };
                    
                    // 無音検出を開始
                    checkSilence();
                } catch (e) {
                    console.warn('音声解析機能を初期化できませんでした:', e);
                    // 代替として、タイマーのみを使用
                }
                
                // 最大録音時間後に自動停止するタイマーを設定（バックアップ）
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        console.log(`${MAX_RECORDING_TIME/1000}秒経過したため録音を自動停止します`);
                        stopRecording();
                    }
                }, MAX_RECORDING_TIME);
            })
            .catch(error => {
                console.error('マイクへのアクセスが拒否されました:', error);
                statusText.textContent = 'マイクへのアクセスが拒否されました';
                addMessageToChat('system', `マイクへのアクセスが拒否されました。ブラウザの許可設定を確認してください。

設定方法: アドレスバーの鍵アイコンをクリックし、「サイトの設定」から「マイク」を「許可」に変更してください。`);
            });
    }
    
    // 録音停止関数
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('録音を停止します');
            mediaRecorder.stop();
            micButton.classList.remove('recording');
            statusText.textContent = '音声を処理中...';
            
            // 無音検出関連のリソースがあれば解放
            if (window.silenceTimer) {
                clearTimeout(window.silenceTimer);
                window.silenceTimer = null;
            }
        }
    }
    
    // チャット履歴にメッセージを追加する関数
    function addMessageToChat(role, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        // メッセージのアイコンを追加
        const iconElement = document.createElement('div');
        iconElement.className = 'message-icon';
        
        // ロールに応じたアイコンを表示
        if (role === 'user') {
            iconElement.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path></svg>';
        } else if (role === 'assistant') {
            iconElement.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>';
        } else {
            iconElement.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>';
        }
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        messageElement.appendChild(iconElement);
        messageElement.appendChild(messageText);
        chatHistory.appendChild(messageElement);
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
                    const chatResponse = await fetch(`${API_URL}/api/chat`, {
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
                    const speechResponse = await fetch(`${API_URL}/api/speech`, {
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
                    
                    // エラーの種類に応じたユーザーフレンドリーなメッセージ
                    if (error.message.includes('Chat error') || error.message.includes('Speech error')) {
                        addMessageToChat('system', 'AIアシスタントとの通信中にエラーが発生しました。しばらくしてからもう一度お試しください。');
                    } else if (error.message.includes('network') || error.message.includes('fetch')) {
                        addMessageToChat('system', 'ネットワークエラーが発生しました。インターネット接続を確認してください。');
                    } else {
                        addMessageToChat('system', `エラーが発生しました: ${error.message}`);
                    }
                    
                    // アナリティクスにエラーを送信（オプション）
                    try {
                        console.log('エラー情報を記録しました:', error.message);
                    } catch (e) {
                        // アナリティクス送信エラーは無視
                    }
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
