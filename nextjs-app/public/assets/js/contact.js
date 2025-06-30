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
        if (key !== '_honey' && key !== '_csrf' && key !== '_captcha' && key !== '_subject' && key !== '_next' && key !== '_template' && key !== '_autoresponse') {
          formDataObj[key] = value
        }
      })

      // APIエンドポイントにPOSTリクエスト送信
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      })
        .then(response => {
          if (response.ok) {
            // 送信成功時の処理
            alert('お問い合わせを受け付けました。担当者よりご連絡いたします。')
            contactForm.reset()
            submitButton.disabled = false
            submitButton.textContent = '送信する'
          } else {
            // エラー処理
            response.json().then(errorData => {
              alert(errorData.message || '送信に失敗しました。後ほど再度お試しください。')
            }).catch(() => {
              alert('送信に失敗しました。後ほど再度お試しください。')
            })
            // 送信ボタンを再有効化
            submitButton.disabled = false
            submitButton.textContent = '送信する'
          }
        })
        .catch(error => {
          console.error('Error:', error)
          alert('送信に失敗しました。後ほど再度お試しください。')
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
