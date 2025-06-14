document.addEventListener('DOMContentLoaded', function () {
  // ハンバーガーメニューの動作
  const menuToggle = document.querySelector('.menu-toggle')
  const mobileNav = document.querySelector('.mobile-nav')
  const body = document.body

  if (menuToggle && mobileNav) {
    // ハンバーガーメニューのクリック処理
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      
      const isActive = mobileNav.classList.contains('active')
      
      if (isActive) {
        // メニューを閉じる
        mobileNav.classList.remove('active')
        setTimeout(() => {
          mobileNav.style.display = 'none'
        }, 300)
        body.style.overflow = ''
        this.innerHTML = '☰'
        // 全てのドロップダウンを閉じる
        const activeDropdowns = mobileNav.querySelectorAll('.dropdown.active')
        activeDropdowns.forEach(dropdown => {
          dropdown.classList.remove('active')
        })
      } else {
        // メニューを開く
        mobileNav.style.display = 'block'
        mobileNav.classList.add('active')
        body.style.overflow = 'hidden'
        this.innerHTML = '✕'
      }
    })

    // ドロップダウンメニューの動作
    const dropdowns = mobileNav.querySelectorAll('.dropdown')
    dropdowns.forEach(dropdown => {
      const dropdownLink = dropdown.querySelector('a')
      if (dropdownLink) {
        dropdownLink.addEventListener('click', function (e) {
          e.preventDefault()
          e.stopPropagation()
          
          // 他のドロップダウンを閉じる
          dropdowns.forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
              otherDropdown.classList.remove('active')
            }
          })
          
          // 現在のドロップダウンをトグル
          dropdown.classList.toggle('active')
        })
      }
    })

    // ドロップダウン内のサブメニューリンクのクリック処理
    const subMenuLinks = mobileNav.querySelectorAll('.dropdown-content a')
    subMenuLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        // サブメニューをクリックしたらモバイルナビを閉じる
        mobileNav.classList.remove('active')
        setTimeout(() => {
          mobileNav.style.display = 'none'
        }, 300)
        body.style.overflow = ''
        menuToggle.innerHTML = '☰'
        // 全てのドロップダウンを閉じる
        const activeDropdowns = mobileNav.querySelectorAll('.dropdown.active')
        activeDropdowns.forEach(dropdown => {
          dropdown.classList.remove('active')
        })
      })
    })

    // 通常のメニューリンク（ドロップダウンでない）のクリック処理
    const normalLinks = mobileNav.querySelectorAll('li:not(.dropdown) > a')
    normalLinks.forEach(link => {
      link.addEventListener('click', function () {
        // 通常のリンクをクリックしたらモバイルナビを閉じる
        mobileNav.classList.remove('active')
        setTimeout(() => {
          mobileNav.style.display = 'none'
        }, 300)
        body.style.overflow = ''
        menuToggle.innerHTML = '☰'
      })
    })

    // 画面サイズ変更時の処理
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        mobileNav.classList.remove('active')
        mobileNav.style.display = 'none'
        body.style.overflow = ''
        menuToggle.innerHTML = '☰'
        // 全てのドロップダウンを閉じる
        const activeDropdowns = mobileNav.querySelectorAll('.dropdown.active')
        activeDropdowns.forEach(dropdown => {
          dropdown.classList.remove('active')
        })
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
