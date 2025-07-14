document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // 送信ボタンを無効化
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';

    try {
      // フォームデータの取得
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

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
