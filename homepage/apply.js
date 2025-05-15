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
});

// フォーム送信処理
document.getElementById("apply-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // フォームデータの取得
  const formData = new FormData(e.target);
  const formDataObj = Object.fromEntries(formData);
  
  // ハニーポット判定 - botが埋めた場合は何もせずに処理終了
  if (formDataObj.hp) {
    console.log("Honeypot triggered");
    // 成功を装って処理を終了
    window.location.href = 'thanks.html';
    return;
  }
  
  // 入力値のサニタイズ
  const sanitizedData = sanitizeFormData(formDataObj);
  
  // バリデーション
  const validationResult = schema.safeParse(sanitizedData);
  
  if (!validationResult.success) {
    // バリデーションエラーの処理
    const errors = validationResult.error.errors;
    const errorMessages = errors.map(err => err.message).join('\n');
    alert(`入力に誤りがあります:\n${errorMessages}`);
    return;
  }
  
  // 送信データの準備
  const submissionData = {
    ...validationResult.data,
    // address_line2が空の場合はundefinedにして、APIで処理しやすくする
    address_line2: validationResult.data.address_line2 || undefined
  };
  
  // ローディング表示
  const submitButton = document.getElementById('submit-button');
  submitButton.disabled = true;
  submitButton.innerText = '送信中...';
  
  try {
    // Vercelのサーバーレス関数にデータを送信
    const response = await fetch("/api/apply", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRF-Token": sanitizedData.csrf_token
      },
      body: JSON.stringify(submissionData)
    });
    
    if (response.ok) {
      // 送信成功時、thanks.htmlにリダイレクト
      window.location.href = 'thanks.html';
    } else {
      // エラーレスポンスの処理
      const errorData = await response.json();
      let errorMessage = '送信に失敗しました。後ほど再度お試しください。';
      
      if (errorData.error === 'invalid') {
        errorMessage = '入力内容に問題があります。入力内容を確認してください。';
      } else if (errorData.error === 'email_error') {
        errorMessage = 'メール送信に失敗しました。後ほど再度お試しください。';
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('送信エラー:', error);
    alert(error.message || '送信に失敗しました。後ほど再度お試しください。');
    submitButton.disabled = false;
    submitButton.innerText = '応募する';
  }
});
