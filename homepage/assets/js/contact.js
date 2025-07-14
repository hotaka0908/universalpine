document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm');

  // バリデーション関数
  function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value.trim();
    const privacy = document.getElementById('privacy').checked;

    // エラーメッセージをクリア
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
    });

    let isValid = true;

    // 名前のバリデーション
    if (!name) {
      document.getElementById('name-error').textContent = 'お名前は必須です';
      isValid = false;
    }

    // メールアドレスのバリデーション
    if (!email) {
      document.getElementById('email-error').textContent = 'メールアドレスは必須です';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください';
      isValid = false;
    }

    // カテゴリのバリデーション
    if (!category) {
      document.getElementById('category-error').textContent = 'カテゴリを選択してください';
      isValid = false;
    }

    // メッセージのバリデーション
    if (!message) {
      document.getElementById('message-error').textContent = 'お問い合わせ内容は必須です';
      isValid = false;
    }

    // プライバシーポリシーのバリデーション
    if (!privacy) {
      document.getElementById('privacy-error').textContent = 'プライバシーポリシーに同意してください';
      isValid = false;
    }

    return isValid;
  }

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // バリデーションチェック
    if (!validateForm()) {
      return;
    }

    // 送信ボタンを無効化
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';

    try {
      // フォームデータの取得
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // プライバシーポリシーのチェック状態を確実に送信
      data.privacy = document.getElementById('privacy').checked ? 'on' : '';

      console.log('送信データ:', data);
      console.log('APIエンドポイント:', '/api/contact');

      // APIに送信
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        console.log('送信成功:', result);
        window.location.href = '/thanks.html';
      } else {
        throw new Error(result.message || '送信に失敗しました');
      }

    } catch (error) {
      console.error('送信エラー:', error);
      alert(`送信に失敗しました: ${error.message}`);
      
      // 送信ボタンを再有効化
      submitButton.disabled = false;
      submitButton.textContent = '送信する';
    }
  });
});
