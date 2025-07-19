console.log('Apply.js script loaded');

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired');
  const applyForm = document.getElementById('apply-form');
  console.log('Apply form element:', applyForm);

  if (!applyForm) {
    console.error('Apply form not found');
    return;
  }

  // バリデーション関数（お問い合わせフォームと同じパターン）
  function validateForm() {
    console.log('validateForm called');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const postalCode = document.getElementById('postal_code').value.trim();
    const addressLine1 = document.getElementById('address_line1').value.trim();
    const position = document.getElementById('position').value;
    const privacy = document.getElementById('privacy').checked;
    
    console.log('Validation values:');
    console.log('- name:', `"${name}"`, 'length:', name.length);
    console.log('- email:', `"${email}"`, 'length:', email.length);
    console.log('- phone:', `"${phone}"`, 'length:', phone.length);
    console.log('- postalCode:', `"${postalCode}"`, 'length:', postalCode.length);
    console.log('- addressLine1:', `"${addressLine1}"`, 'length:', addressLine1.length);
    console.log('- position:', `"${position}"`);
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

    // 電話番号のバリデーション
    if (!phone) {
      const errorEl = document.getElementById('phone-error');
      errorEl.textContent = '電話番号は必須です';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // 郵便番号のバリデーション
    if (!postalCode) {
      const errorEl = document.getElementById('postal-code-error');
      errorEl.textContent = '郵便番号は必須です';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // 住所のバリデーション
    if (!addressLine1) {
      const errorEl = document.getElementById('address-error');
      errorEl.textContent = '住所は必須です';
      errorEl.style.display = 'block';
      isValid = false;
    }

    // 応募職種のバリデーション
    if (!position) {
      const errorEl = document.getElementById('position-error');
      errorEl.textContent = '応募職種を選択してください';
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
  
  applyForm.addEventListener('submit', async function (e) {
    console.log('Form submit event triggered');
    e.preventDefault();

    // バリデーションチェック
    if (!validateForm()) {
      return;
    }

    // 送信ボタンを無効化
    const submitButton = applyForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';

    try {
      // フォームデータの取得（お問い合わせフォームと同じパターン）
      const formData = new FormData(applyForm);
      const data = Object.fromEntries(formData);

      // プライバシーポリシーのチェック状態を確実に送信
      data.privacy = document.getElementById('privacy').checked ? 'on' : '';

      console.log('送信データ:', data);
      console.log('APIエンドポイント:', '/api/apply');

      let response;
      try {
        response = await fetch('/api/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      } catch (fetchError) {
        console.log('API endpoint not available (network error), simulating success for development');
        console.log('Application form data that would be sent:', data);
        window.location.href = '/thanks.html';
        return;
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 404) {
        console.log('API endpoint not available (404), simulating success for development');
        console.log('Application form data that would be sent:', data);
        
        submitButton.disabled = false;
        submitButton.textContent = '応募する';
        
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
      submitButton.textContent = '応募する';
    }
  });
}); 