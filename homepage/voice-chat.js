// config.jsの読み込みを確認
if (typeof window.config === 'undefined') {
    console.warn('config.jsが読み込まれていません。APIキーが利用できない可能性があります。');
}

document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const micButton = document.getElementById('mic-button');
    const statusText = document.getElementById('status-text');
    const chatHistory = document.getElementById('chat-history');
    const clearButton = document.getElementById('clear-button');
    const textModeButton = document.getElementById('text-mode-button');
    const voiceChatToggle = document.getElementById('voice-chat-toggle');
    const voiceChatContainer = document.getElementById('voice-chat-widget');
    
    // Web Speech API のサポートチェック
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (!SpeechRecognition) {
        statusText.textContent = 'お使いのブラウザは音声認識をサポートしていません';
        micButton.disabled = true;
        return;
    }
    
    // 音声認識の設定
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // 音声合成の設定
    const synth = window.speechSynthesis;
    let voices = [];
    
    // 音声の取得（非同期）
    function loadVoices() {
        voices = synth.getVoices();
    }
    
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    // 日本語の音声を優先的に選択
    function getJapaneseVoice() {
        // 日本語の音声を探す
        for (let voice of voices) {
            if (voice.lang === 'ja-JP') {
                return voice;
            }
        }
        // 日本語がなければデフォルトの音声を返す
        return voices[0];
    }
    
    // メッセージを追加する関数
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // AIの応答を生成する関数 - OpenAI APIを使用
    async function generateAIResponse(userInput) {
        try {
            // OpenAI APIキーの確認
            if (!window.config || !window.config.apiKey) {
                console.error('APIキーが設定されていません');
                return 'すみません、現在AIサービスに接続できません。後ほどお試しください。';
            }
            
            const apiKey = window.config.apiKey;
            statusText.textContent = 'OpenAI APIに接続中...';
            
            // APIリクエストの設定
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたはUniversal Pineという会社のAIアシスタントです。日本語で簡潔に応答してください。会社はAI技術を専門とし、AIネックレスという製品を開発しています。AIネックレスは日常の大切な瞬間を自動的に記録し、プライバシーを守りながら思い出を残す製品です。'
                        },
                        {
                            role: 'user',
                            content: userInput
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error('OpenAI API error:', error);
            
            // エラー時のフォールバック応答
            const fallbackResponses = [
                "申し訳ありません、現在サーバーに接続できません。後ほどお試しください。",
                "一時的な通信エラーが発生しました。しばらくしてからもう一度お試しください。",
                "ネットワーク接続に問題が発生しました。接続を確認してお試しください。",
                "AIサービスが一時的に利用できません。後ほどお試しください。"
            ];
            
            const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
            return fallbackResponses[randomIndex];
        }
    }
    
    // テキストを音声で読み上げる関数
    function speakText(text) {
        if (synth.speaking) {
            synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = getJapaneseVoice();
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        
        synth.speak(utterance);
        
        return new Promise(resolve => {
            utterance.onend = resolve;
        });
    }
    
    // 音声認識の開始
    function startListening() {
        recognition.start();
        micButton.classList.add('listening');
        statusText.textContent = '聞いています...';
    }
    
    // 音声認識の結果処理
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        addMessage(transcript, true);
        
        micButton.classList.remove('listening');
        micButton.classList.add('processing');
        statusText.textContent = '考え中...';
        
        // AIの応答を生成
        const aiResponse = await generateAIResponse(transcript);
        
        statusText.textContent = '応答中...';
        addMessage(aiResponse, false);
        
        // 応答を音声で読み上げる
        await speakText(aiResponse);
        
        micButton.classList.remove('processing');
        statusText.textContent = '話しかけてください';
    };
    
    // 音声認識のエラー処理
    recognition.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        micButton.classList.remove('listening');
        micButton.classList.remove('processing');
        statusText.textContent = 'エラーが発生しました。再試行してください。';
    };
    
    // 音声認識の終了処理
    recognition.onend = () => {
        if (!micButton.classList.contains('processing')) {
            micButton.classList.remove('listening');
            if (statusText.textContent === '聞いています...') {
                statusText.textContent = '話しかけてください';
            }
        }
    };
    
    // マイクボタンのクリックイベント
    micButton.addEventListener('click', () => {
        if (synth.speaking) {
            synth.cancel();
            micButton.classList.remove('processing');
            statusText.textContent = '話しかけてください';
            return;
        }
        
        if (micButton.classList.contains('listening')) {
            recognition.stop();
        } else {
            startListening();
        }
    });
    
    // 履歴クリアボタンのクリックイベント
    clearButton.addEventListener('click', () => {
        chatHistory.innerHTML = '';
    });
    
    // テキスト入力モードボタンのクリックイベント
    textModeButton.addEventListener('click', async () => {
        const userInput = prompt('メッセージを入力してください:');
        if (userInput && userInput.trim()) {
            addMessage(userInput, true);
            
            micButton.classList.add('processing');
            statusText.textContent = '考え中...';
            
            // AIの応答を生成
            const aiResponse = await generateAIResponse(userInput);
            
            statusText.textContent = '応答中...';
            addMessage(aiResponse, false);
            
            // 応答を音声で読み上げる
            await speakText(aiResponse);
            
            micButton.classList.remove('processing');
            statusText.textContent = '話しかけてください';
        }
    });
    
    // 音声チャットウィジェットの表示/非表示を切り替え
    if (voiceChatToggle) {
        voiceChatToggle.addEventListener('click', () => {
            if (voiceChatContainer.classList.contains('voice-chat-hidden')) {
                voiceChatContainer.classList.remove('voice-chat-hidden');
                voiceChatToggle.innerHTML = '<i class="fas fa-times"></i>';
                voiceChatToggle.setAttribute('aria-label', 'AIアシスタントを閉じる');
            } else {
                voiceChatContainer.classList.add('voice-chat-hidden');
                voiceChatToggle.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceChatToggle.setAttribute('aria-label', 'AIアシスタントを開く');
            }
        });
    }
});
