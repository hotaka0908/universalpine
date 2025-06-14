document.addEventListener('DOMContentLoaded', function () {
  // ハンバーガーメニューの動作
  const menuToggle = document.querySelector('.menu-toggle')
  const mobileNav = document.querySelector('.mobile-nav')
  const body = document.body

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('active')
      body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : ''
      
      // ハンバーガーアイコンの変更
      this.innerHTML = mobileNav.classList.contains('active') ? '✕' : '☰'
    })

    // モバイルナビゲーション内のリンククリック時にメニューを閉じる
    const mobileNavLinks = mobileNav.querySelectorAll('a')
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function () {
        // ドロップダウンでない場合のみメニューを閉じる
        if (!this.parentElement.classList.contains('dropdown')) {
          mobileNav.classList.remove('active')
          body.style.overflow = ''
          menuToggle.innerHTML = '☰'
        }
      })
    })

    // ドロップダウンメニューの動作
    const dropdowns = mobileNav.querySelectorAll('.dropdown')
    dropdowns.forEach(dropdown => {
      const dropdownLink = dropdown.querySelector('a')
      if (dropdownLink) {
        dropdownLink.addEventListener('click', function (e) {
          e.preventDefault()
          dropdown.classList.toggle('active')
        })
      }
    })

    // 画面サイズ変更時の処理
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        mobileNav.classList.remove('active')
        body.style.overflow = ''
        menuToggle.innerHTML = '☰'
      }
    })
  }

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
})
