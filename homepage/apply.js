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
    
    if (applyForm) {
        applyForm.addEventListener('submit', function(e) {
            // フォームのネイティブバリデーションを活用するため、条件付きでpreventDefault()を使用
            
            // 必須項目のバリデーション
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const postalCode = document.getElementById('postal_code').value.trim();
            const address = document.getElementById('address_line1').value.trim();
            const position = document.getElementById('position').value;
            const resume = document.getElementById('resume').value;
            const portfolio = document.getElementById('portfolio').value;
            
            if (!name || !email || !phone || !postalCode || !address || !position || !resume || !portfolio) {
                alert('必須項目をすべて入力してください。');
                e.preventDefault();
                return;
            }
            
            // 電話番号のバリデーション（日本の電話番号形式）
            const phonePattern = /^(0[0-9]{1,4}-[0-9]{1,4}-[0-9]{3,4}|\+81[0-9]{1,4}-[0-9]{1,4}-[0-9]{3,4}|\+81[0-9]{9,10}|0[0-9]{9,10})$/;
            if (!phonePattern.test(phone)) {
                alert('電話番号の形式が正しくありません。例: 03-1234-5678 または 090-1234-5678');
                e.preventDefault();
                return;
            }
            
            // メールアドレスの追加検証
            const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailPattern.test(email)) {
                alert('メールアドレスの形式が正しくありません。');
                e.preventDefault();
                return;
            }
            
            // 郵便番号の検証（日本の郵便番号形式）
            const postalCodePattern = /^\d{3}-?\d{4}$/;
            if (!postalCodePattern.test(postalCode)) {
                alert('郵便番号の形式が正しくありません。例: 123-4567');
                e.preventDefault();
                return;
            }
            
            // 入力値のサニタイズ
            document.getElementById('name').value = sanitizeInput(name);
            document.getElementById('email').value = sanitizeInput(email);
            document.getElementById('phone').value = sanitizeInput(phone);
            document.getElementById('postal_code').value = sanitizeInput(postalCode);
            document.getElementById('address_line1').value = sanitizeInput(address);
            
            // フォームが正常に送信される場合、thanks.htmlにリダイレクト
            setTimeout(function() {
                window.location.href = 'thanks.html';
            }, 100);
        });
    }
});
