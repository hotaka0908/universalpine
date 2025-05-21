// OpenAI API設定
const config = {
    apiKey: process.env.resend_key || "", // 環境変数から取得
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",
    maxTokens: 150,
    temperature: 0.7
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
