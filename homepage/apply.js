document.addEventListener('DOMContentLoaded', function() {
    const applyForm = document.getElementById('apply-form');
    
    // CSRF トークン生成と設定
    function generateCSRFToken() {
        const token = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15) + 
                     Date.now().toString(36);
        return token;
    }
    
    // CSRFトークンをフォームに設定
    const csrfToken = generateCSRFToken();
    document.getElementById('csrf_token').value = csrfToken;
    
    // セッションストレージにトークンを保存（サーバー検証用）
    sessionStorage.setItem('csrf_token', csrfToken);
    
    // 注意: EmailJSの初期化はHTML内のスクリプトで行われています
    
    // 入力値のサニタイズ
    function sanitizeInput(input) {
        return input.replace(/[<>&"']/g, function(match) {
            switch (match) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&#x27;';
                default: return match;
            }
        });
    }
    
    // 注意: sendEmail関数はHTML内で定義されており、こちらの関数は使用されません
});
