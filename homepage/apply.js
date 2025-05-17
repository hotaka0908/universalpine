import { z } from "https://cdn.skypack.dev/zod@3.22.2";

// バリデーションスキーマの定義
const schema = z.object({
  name: z.string().min(1, "お名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().min(1, "電話番号は必須です"),
  postal_code: z.string().min(1, "郵便番号は必須です"),
  address_line1: z.string().min(1, "住所は必須です"),
  address_line2: z.string().optional(),
  position: z.string().min(1, "応募職種は必須です"),
  resume_url: z.string().url("履歴書URLの形式が正しくありません"),
  portfolio_url: z.string().url("職務経歴書URLの形式が正しくありません"),
  message: z.string().optional(),
  hp: z.string().max(0, "ボットによる送信と判断されました").optional() // ハニーポット
});

// CSRF トークン生成関数
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2, 15) + 
              Math.random().toString(36).substring(2, 15) + 
              Date.now().toString(36);
  return token;
}

// 入力値のサニタイズ関数
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
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

// フォームデータをサニタイズする関数
function sanitizeFormData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = sanitizeInput(value);
  }
  return sanitized;
}

// DOMコンテンツ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
  // CSRFトークンの設定
  const csrfToken = generateCSRFToken();
  const csrfTokenInput = document.getElementById('csrf_token');
  if (csrfTokenInput) {
    csrfTokenInput.value = csrfToken;
    // セッションストレージにトークンを保存（サーバー検証用）
    sessionStorage.setItem('csrf_token', csrfToken);
  }

  // フォーム要素の取得
  const applyForm = document.getElementById('apply-form');
  const submitButton = document.getElementById('submit-button');
  const errorElements = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    phone: document.getElementById('phone-error'),
    postal_code: document.getElementById('postal-code-error'),
    address_line1: document.getElementById('address-line1-error'),
    position: document.getElementById('position-error'),
    resume_url: document.getElementById('resume-url-error'),
    portfolio_url: document.getElementById('portfolio-url-error')
  };

  // フォーム送信時の処理
  applyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 送信ボタンを無効化し、ローディング表示
    submitButton.disabled = true;
    submitButton.innerText = '送信中...';
    
    // フォームデータの取得
    const formData = new FormData(applyForm);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    
    try {
      // バリデーション実行
      const validatedData = schema.parse(formObject);
      
      // エラー表示をクリア
      Object.values(errorElements).forEach(el => {
        if (el) el.textContent = '';
      });
      
      // データのサニタイズ
      const sanitizedData = sanitizeFormData(validatedData);
      
      // APIへの送信処理をシミュレート
      // 実際の実装ではここでfetchを使ってAPIに送信
      console.log('送信データ:', sanitizedData);
      
      // 成功時の処理 (デモ用にリダイレクト)
      setTimeout(() => {
        window.location.href = 'thanks.html';
      }, 1000);
      
    } catch (error) {
      // Zodのバリデーションエラー処理
      if (error.errors) {
        error.errors.forEach(err => {
          const field = err.path[0];
          const errorElement = errorElements[field];
          if (errorElement) {
            errorElement.textContent = err.message;
          }
        });
      } else {
        // その他のエラー
        console.error('フォーム送信エラー:', error);
        alert('送信中にエラーが発生しました。後ほど再度お試しください。');
      }
      
      // 送信ボタンを元に戻す
      submitButton.disabled = false;
      submitButton.innerText = '応募する';
    }
  });
});