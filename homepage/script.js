document.addEventListener('DOMContentLoaded', function () {
  // ハンバーガーメニューの処理は js/mobile-menu.js に移管
  // 重複を避けるためここでは処理しない

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      const targetId = this.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for header
          behavior: 'smooth'
        })
      }
    })
  })

  // Form submission handling
  const contactForm = document.querySelector('.contact-form')
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault()

      // In a real implementation, you would send the form data to a server
      // For now, just show a success message
      alert('お問い合わせありがとうございます。近日中にご連絡いたします。')
      this.reset()
    })
  }

  // Career application button
  const applyButton = document.querySelector('.apply-button')
  if (applyButton) {
    applyButton.addEventListener('click', function () {
      // In a real implementation, this would redirect to an application form
      // For now, just scroll to the contact form
      const contactSection = document.querySelector('#contact')
      if (contactSection) {
        window.scrollTo({
          top: contactSection.offsetTop - 80,
          behavior: 'smooth'
        })

        // Pre-select the recruitment option in the dropdown
        const categorySelect = document.querySelector('#category')
        if (categorySelect) {
          for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value === 'recruitment') {
              categorySelect.selectedIndex = i
              break
            }
          }
        }
      }
    })
  }

  // ミッションセクションのアコーディオンボタンの処理
  const accordionButtons = document.querySelectorAll('.accordion-button')
  
  accordionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const isExpanded = this.classList.contains('active')
      this.classList.toggle('active')
      
      // ARIA属性の更新
      this.setAttribute('aria-expanded', !isExpanded)
      
      const content = this.nextElementSibling
      
      if (content.style.maxHeight) {
        content.style.maxHeight = null
        this.textContent = 'ミッション詳細を表示'
        this.title = 'ミッション詳細を表示'
      } else {
        content.style.maxHeight = content.scrollHeight + 'px'
        this.textContent = 'ミッション詳細を閉じる'
        this.title = 'ミッション詳細を閉じる'
      }
    })
    
    // キーボードアクセシビリティ（Enter/Space キー）
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        this.click()
      }
    })
  })
})
