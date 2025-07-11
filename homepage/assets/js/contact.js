document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm')
  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    category: document.getElementById('category'),
    message: document.getElementById('message'),
    privacy: document.getElementById('privacy')
  }

  // エラーメッセージ要素
  const errorElements = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    category: document.getElementById('category-error'),
    message: document.getElementById('message-error'),
    privacy: document.getElementById('privacy-error')
  }

  // バリデーションメッセージ
  const errorMessages = {
    required: 'この項目は必須です',
    email: '有効なメールアドレスを入力してください',
    privacy: 'プライバシーポリシーに同意してください'
  }

  // フォームのバリデーション
  function validateField (field, fieldName) {
    let isValid = true
    const errorElement = errorElements[fieldName]

    // 必須フィールドのチェック
    if (field.required && !field.value.trim()) {
      errorElement.textContent = errorMessages.required
      field.classList.add('error')
      isValid = false
    }
    // メールアドレスの形式チェック
    else if (fieldName === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(field.value.trim())) {
        errorElement.textContent = errorMessages.email
        field.classList.add('error')
        isValid = false
      }
    }
    // チェックボックスの確認
    else if (fieldName === 'privacy' && field.required && !field.checked) {
      errorElement.textContent = errorMessages.privacy
      isValid = false
    } else {
      errorElement.textContent = ''
      field.classList.remove('error')
    }

    return isValid
  }

  // すべてのフィールドのバリデーション
  function validateForm () {
    let isValid = true

    for (const fieldName in fields) {
      if (!validateField(fields[fieldName], fieldName)) {
        isValid = false
      }
    }

    return isValid
  }

  // フォーム送信時の処理
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault()

    if (validateForm()) {
      // 送信ボタンを無効化
      const submitButton = contactForm.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = '送信中...'

      // フォームデータの作成
      const formData = new FormData(contactForm)

      // フォームデータをオブジェクトに変換
      const formDataObj = {}
      formData.forEach((value, key) => {
        formDataObj[key] = value
      })
      
      console.log('送信データ:', formDataObj)

      // VercelのAPIエンドポイントにPOSTリクエスト送信
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      })
        .then(response => {
          console.log('Response status:', response.status)
          return response.json().then(data => ({ status: response.status, data }))
        })
        .then(({ status, data }) => {
          if (status === 200) {
            // 送信成功時の処理
            console.log('送信成功:', data)
            window.location.href = '/thanks.html'
          } else {
            // エラー処理
            console.error('送信エラー:', data)
            alert(`送信に失敗しました: ${data.message || 'エラーが発生しました'}`)
            // 送信ボタンを再有効化
            submitButton.disabled = false
            submitButton.textContent = '送信する'
          }
        })
        .catch(error => {
          console.error('Network Error:', error)
          alert('ネットワークエラーが発生しました。インターネット接続を確認してください。')
          // 送信ボタンを再有効化
          submitButton.disabled = false
          submitButton.textContent = '送信する'
        })
    }
  })

  // リアルタイムバリデーション
  for (const fieldName in fields) {
    const field = fields[fieldName]

    // 入力フィールドの変更時にバリデーション
    field.addEventListener('blur', function () {
      validateField(field, fieldName)
    })

    // 入力中にエラー表示をクリア
    field.addEventListener('input', function () {
      const errorElement = errorElements[fieldName]
      errorElement.textContent = ''
      field.classList.remove('error')
    })
  }
})
