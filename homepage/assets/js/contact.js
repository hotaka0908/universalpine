console.log('Contact.js script loaded');

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired');
  const contactForm = document.getElementById('contactForm');
  console.log('Contact form element:', contactForm);

  // バリデーション関数
  function validateForm() {
    console.log('validateForm called');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value.trim();
    const privacy = document.getElementById('privacy').checked;
    
    console.log('Validation values:');
    console.log('- name:', `"${name}"`, 'length:', name.length);
    console.log('- email:', `"${email}"`, 'length:', email.length);
    console.log('- category:', `"${category}"`);
    console.log('- message:', `"${message}"`, 'length:', message.length);
    console.log('- privacy:', privacy);

    // エラーメッセージをクリア
    console.log('Clearing error messages');
    document.querySelectorAll('.error-message').forEach(el => {
      console.log('Clearing error element:', el.id, 'current text:', el.textContent);
      el.textContent = '';
      el.style.display = 'none';
    });

    let isValid = true;

    // 名前のバリデーション
    if (!name) {
      const errorEl = document.getElementById('name-error');
      errorEl.textContent = 'お名前は必須です';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // メールアドレスのバリデーション
    if (!email) {
      const errorEl = document.getElementById('email-error');
      errorEl.textContent = 'メールアドレスは必須です';
      errorEl.style.display = 'block';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const errorEl = document.getElementById('email-error');
      errorEl.textContent = '有効なメールアドレスを入力してください';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // カテゴリのバリデーション
    if (!category) {
      const errorEl = document.getElementById('category-error');
      errorEl.textContent = 'カテゴリを選択してください';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // メッセージのバリデーション
    if (!message) {
      const errorEl = document.getElementById('message-error');
      errorEl.textContent = 'お問い合わせ内容は必須です';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // プライバシーポリシーのバリデーション
    if (!privacy) {
      const errorEl = document.getElementById('privacy-error');
      errorEl.textContent = 'プライバシーポリシーに同意してください';
      errorEl.style.display = 'block';
      isValid = false;
    }

    return isValid;
  }

  window.validateForm = validateForm;
  
  contactForm.addEventListener('submit', async function (e) {
    console.log('Form submit event triggered');
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

      let response;
      try {
        response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      } catch (fetchError) {
        console.log('API endpoint not available (network error), simulating success for development');
        console.log('Form data that would be sent:', data);
        alert('開発環境: フォームデータが正常に処理されました。本番環境ではメールが送信されます。');
        window.location.href = '/thanks.html';
        return;
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 404) {
        console.log('API endpoint not available (404), simulating success for development');
        console.log('Form data that would be sent:', data);
        alert('開発環境: フォームデータが正常に処理されました。本番環境ではメールが送信されます。');
        
        submitButton.disabled = false;
        submitButton.textContent = '送信する';
        
        window.location.href = '/thanks.html';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      console.log('送信成功:', result);
      window.location.href = '/thanks.html';

    } catch (error) {
      console.error('送信エラー:', error);
      alert(`送信に失敗しました: ${error.message}`);
      
      // 送信ボタンを再有効化
      submitButton.disabled = false;
      submitButton.textContent = '送信する';
    }
  });
});
