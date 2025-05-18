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
    
    // AIの応答を生成する関数
    async function generateAIResponse(userInput) {
        // Universal Pineの製品やサービスに関連する応答
        const responses = [
            "Universal Pineの音声AIアシスタントへようこそ。どのようにお手伝いできますか？",
            "当社のAIネックレスについて詳しく知りたい場合は、製品ページをご覧ください。",
            "Universal Pineは最先端のAI技術で人々の生活をより良くすることを目指しています。",
            "採用情報についてのご質問でしたら、詳細は採用ページをご確認ください。",
            "お問い合わせフォームからメッセージをお送りいただければ、担当者からご連絡いたします。",
            "AIネックレスは日常の大切な瞬間を自動的に記録し、プライバシーを守りながら思い出を残します。",
            "当社の製品は最先端の技術と美しいデザインを兼ね備えています。",
            "Universal Pineは2025年に設立された、AI技術を専門とする企業です。",
            "ご質問ありがとうございます。もう少し詳しく教えていただけますか？",
            "申し訳ありませんが、その情報は現在持ち合わせておりません。お問い合わせフォームからお問い合わせください。"
        ];
        
        // 簡易デモ用にランダムな応答を返す
        return new Promise(resolve => {
            // 応答生成の遅延をシミュレート
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * responses.length);
                resolve(responses[randomIndex]);
            }, 1000);
        });
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
