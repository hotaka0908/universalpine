// OpenAI API設定
const config = {
    apiKey: "", // API keys should be handled server-side. process.env is not available here.
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
