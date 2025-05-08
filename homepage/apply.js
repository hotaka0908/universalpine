document.addEventListener('DOMContentLoaded', function() {
    const applyForm = document.getElementById('apply-form');
    
    if (applyForm) {
        applyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 簡易的なバリデーション
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const position = document.getElementById('position').value;
            const resume = document.getElementById('resume').value;
            const portfolio = document.getElementById('portfolio').value;
            
            if (!name || !email || !position || !resume || !portfolio) {
                alert('必須項目をすべて入力してください。');
                return;
            }
            
            // フォーム送信処理（実際にはサーバーサイドの処理が必要）
            // ここではデモとしてthanksページに遷移
            window.location.href = 'thanks.html';
        });
    }
});
