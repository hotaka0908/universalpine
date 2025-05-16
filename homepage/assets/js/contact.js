document.addEventListener('DOMContentLoaded', function () {
  console.log('Contact form script loaded')

  // CSRFトークンの生成と設定
  function generateCSRFToken () {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const csrfToken = document.getElementById('csrf_token')
    if (csrfToken) {
      csrfToken.value = token
      // セッションストレージにトークンを保存（実際の実装ではサーバーサイドで検証する）
      sessionStorage.setItem('csrf_token', token)
    }
    return token
  }

  // 入力値のサニタイズ処理
  function sanitizeInput (input) {
    if (!input) return ''
    // HTMLタグをエスケープ
    return input.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
  }

  // 入力値の検証（より厳格なパターン）
  function validateEmail (email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email)
  }

  // 名前の検証
  function validateName (name) {
    return name.length >= 2 && name.length <= 50
  }

  // メッセージの検証
  function validateMessage (message) {
    return message.length >= 10 && message.length <= 1000
  }

  // CSRFトークンを生成
  generateCSRFToken()

  // Get form elements
  const contactForm = document.getElementById('contactForm')
  const confirmationModal = document.getElementById('confirmationModal')
  const closeModalBtn = document.getElementById('closeModal')
  const submitFormBtn = document.getElementById('submitForm')
  const confirmButton = document.querySelector('.submit-button')
  const formFields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    category: document.getElementById('category'),
    message: document.getElementById('message'),
    privacy: document.getElementById('privacy')
  }
  const confirmFields = {
    name: document.getElementById('confirm-name'),
    email: document.getElementById('confirm-email'),
    category: document.getElementById('confirm-category'),
    message: document.getElementById('confirm-message')
  }

  // Show confirmation modal with form data
  function showConfirmation (formData) {
    // サニタイズしてから確認フィールドに表示
    confirmFields.name.textContent = sanitizeInput(formData.get('name'))
    confirmFields.email.textContent = sanitizeInput(formData.get('email'))

    // Get the selected category text
    const categorySelect = formFields.category
    const selectedOption = categorySelect.options[categorySelect.selectedIndex]
    confirmFields.category.textContent = sanitizeInput(selectedOption.text)

    confirmFields.message.textContent = sanitizeInput(formData.get('message'))

    // XSS対策: innerHTML ではなく textContent を使用

    // Show the modal
    confirmationModal.style.display = 'flex'
    document.body.style.overflow = 'hidden' // Prevent scrolling
  }

  // Close the confirmation modal
  function closeModal () {
    confirmationModal.style.display = 'none'
    document.body.style.overflow = 'auto' // Re-enable scrolling
  }

  // Handle form submission
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault()

    // 強化された検証
    let isValid = true

    // 名前の検証
    if (!formFields.name.value.trim()) {
      document.getElementById('name-error').textContent = 'お名前を入力してください'
      isValid = false
    } else if (!validateName(formFields.name.value.trim())) {
      document.getElementById('name-error').textContent = 'お名前は2〜50文字で入力してください'
      isValid = false
    } else {
      document.getElementById('name-error').textContent = ''
    }

    // メールアドレスの検証
    if (!formFields.email.value.trim()) {
      document.getElementById('email-error').textContent = 'メールアドレスを入力してください'
      isValid = false
    } else if (!validateEmail(formFields.email.value.trim())) {
      document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください'
      isValid = false
    } else {
      document.getElementById('email-error').textContent = ''
    }

    // カテゴリの検証
    if (formFields.category.value === '') {
      document.getElementById('category-error').textContent = 'カテゴリを選択してください'
      isValid = false
    } else {
      document.getElementById('category-error').textContent = ''
    }

    // メッセージの検証
    if (!formFields.message.value.trim()) {
      document.getElementById('message-error').textContent = 'お問い合わせ内容を入力してください'
      isValid = false
    } else if (!validateMessage(formFields.message.value.trim())) {
      document.getElementById('message-error').textContent = 'お問い合わせ内容は10〜1000文字で入力してください'
      isValid = false
    } else {
      document.getElementById('message-error').textContent = ''
    }

    // プライバシーポリシーの同意確認
    if (!formFields.privacy.checked) {
      document.getElementById('privacy-error').textContent = 'プライバシーポリシーに同意してください'
      isValid = false
    } else {
      document.getElementById('privacy-error').textContent = ''
    }

    // 入力値のサニタイズ
    if (isValid) {
      // フォームデータを取得
      const formData = new FormData(contactForm)

      // CSRFトークンの検証（実際の実装ではサーバーサイドで行う）
      const storedToken = sessionStorage.getItem('csrf_token')
      const formToken = document.getElementById('csrf_token').value

      if (storedToken !== formToken) {
        alert('セキュリティエラー: ページを再読み込みしてください')
        return
      }

      showConfirmation(formData)
    }
  })

  // Handle confirmation button click
  if (confirmButton) {
    confirmButton.addEventListener('click', function () {
      console.log('Confirmation button clicked')

      // Basic validation
      let isValid = true

      if (!formFields.name.value.trim()) {
        document.getElementById('name-error').textContent = 'お名前を入力してください'
        isValid = false
      } else {
        document.getElementById('name-error').textContent = ''
      }

      if (!formFields.email.value.trim()) {
        document.getElementById('email-error').textContent = 'メールアドレスを入力してください'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email.value.trim())) {
        document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください'
        isValid = false
      } else {
        document.getElementById('email-error').textContent = ''
      }

      if (formFields.category.value === '') {
        document.getElementById('category-error').textContent = 'カテゴリを選択してください'
        isValid = false
      } else {
        document.getElementById('category-error').textContent = ''
      }

      if (!formFields.message.value.trim()) {
        document.getElementById('message-error').textContent = 'お問い合わせ内容を入力してください'
        isValid = false
      } else {
        document.getElementById('message-error').textContent = ''
      }

      if (!formFields.privacy.checked) {
        document.getElementById('privacy-error').textContent = 'プライバシーポリシーに同意してください'
        isValid = false
      } else {
        document.getElementById('privacy-error').textContent = ''
      }

      if (isValid) {
        console.log('Form is valid, showing confirmation')
        const formData = new FormData(contactForm)
        showConfirmation(formData)
      }
    })
  }

  // Close modal when clicking the close button
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal)
  }

  // Close modal when clicking the back button
  const backButton = document.getElementById('backButton')
  if (backButton) {
    backButton.addEventListener('click', closeModal)
  }

  // Close modal when clicking outside the content
  if (confirmationModal) {
    confirmationModal.addEventListener('click', function (e) {
      if (e.target === confirmationModal) {
        closeModal()
      }
    })
  }

  // Handle final form submission
  if (submitFormBtn) {
    submitFormBtn.addEventListener('click', function () {
      console.log('Final form submission clicked')

      // CSRFトークンの再検証
      const storedToken = sessionStorage.getItem('csrf_token')
      const formToken = document.getElementById('csrf_token').value

      if (storedToken !== formToken) {
        alert('セキュリティエラー: ページを再読み込みしてください')
        closeModal()
        return
      }

      // 入力値の再検証とサニタイズ
      const formData = new FormData(contactForm)

      // 入力値をサニタイズして再設定
      formData.set('name', sanitizeInput(formData.get('name')))
      formData.set('email', sanitizeInput(formData.get('email')))
      formData.set('message', sanitizeInput(formData.get('message')))

      // セキュリティヘッダーを追加したリクエストオプション
      const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // CSRF対策
          Accept: 'application/json' // JSONレスポンスを受け入れる
        },
        referrerPolicy: 'same-origin', // リファラー情報を制限
        credentials: 'same-origin' // クッキーを送信するドメインを制限
      }

      // Send form data to server with enhanced security
      fetch('https://formsubmit.co/01304b0c4bb0329755e77d5adc3d5138', requestOptions)
        .then(response => {
          if (response.ok) {
            // 成功時はトークンを破棄
            sessionStorage.removeItem('csrf_token')
            // Redirect to thanks page
            window.location.href = 'thanks.html'
          } else {
            throw new Error(`Network response was not ok: ${response.status}`)
          }
        })
        .catch(error => {
          console.error('Error:', error)
          alert('送信中にエラーが発生しました。後でもう一度お試しください。')
        })
    })
  }
})
