// 共通エラーハンドリングユーティリティ

class ErrorHandler {
  static showError(message, duration = 5000) {
    // 既存のエラーメッセージを削除
    this.clearErrors();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // 自動で削除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, duration);
    
    return errorDiv;
  }
  
  static showSuccess(message, duration = 3000) {
    // 既存のメッセージを削除
    this.clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(successDiv);
    
    // 自動で削除
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, duration);
    
    return successDiv;
  }
  
  static clearErrors() {
    document.querySelectorAll('.error-notification').forEach(el => el.remove());
  }
  
  static clearMessages() {
    document.querySelectorAll('.success-notification, .error-notification').forEach(el => el.remove());
  }
  
  static handleApiError(error, customMessage = null) {
    console.error('API Error:', error);
    
    let message = customMessage || 'エラーが発生しました。しばらく後にもう一度お試しください。';
    
    // ネットワークエラーの場合
    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }
    
    // APIレスポンスがある場合
    if (error.response && error.response.data) {
      const responseData = error.response.data;
      if (responseData.message) {
        message = responseData.message;
      } else if (responseData.error) {
        message = responseData.error;
      }
    }
    
    this.showError(message);
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName}は必須項目です。`);
    }
    return true;
  }
  
  static setLoadingState(button, isLoading = true) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = '送信中...';
      button.style.opacity = '0.7';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
      button.style.opacity = '1';
    }
  }
}

// CSSアニメーションを追加
if (!document.querySelector('#error-handler-styles')) {
  const styles = document.createElement('style');
  styles.id = 'error-handler-styles';
  styles.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(styles);
}

// グローバルに利用可能にする
window.ErrorHandler = ErrorHandler;