// u30ecu30b9u30ddu30f3u30b7u30d6u30cau30d3u30b2u30fcu30b7u30e7u30f3u7528JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // u30e2u30d0u30a4u30ebu30cau30d3u30b2u30fcu30b7u30e7u30f3u306eu8981u7d20u3092u53d6u5f97
  const menuToggle = document.querySelector('.menu-toggle')
  const mobileNav = document.querySelector('.mobile-nav')

  // u30cfu30f3u30d0u30fcu30acu30fcu30e1u30cbu30e5u30fcu306eu30afu30eau30c3u30afu30a4u30d9u30f3u30c8
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      // u30e1u30cbu30e5u30fcu306eu958bu9589u72b6u614bu3092u5207u308au66ffu3048
      if (mobileNav.style.display === 'block') {
        mobileNav.style.display = 'none'
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>'
        document.body.style.overflow = 'auto' // u30b9u30afu30edu30fcu30ebu3092u6709u52b9u306b
      } else {
        mobileNav.style.display = 'block'
        menuToggle.innerHTML = '<i class="fas fa-times"></i>'
        document.body.style.overflow = 'hidden' // u30b9u30afu30edu30fcu30ebu3092u7121u52b9u306b
      }
    })

    // u30e2u30d0u30a4u30ebu30cau30d3u30b2u30fcu30b7u30e7u30f3u5185u306eu30eau30f3u30afu30afu30eau30c3u30afu6642u306bu30e1u30cbu30e5u30fcu3092u9589u3058u308b
    const mobileNavLinks = mobileNav.querySelectorAll('a')
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function () {
        mobileNav.style.display = 'none'
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>'
        document.body.style.overflow = 'auto'
      })
    })
  }

  // u30a6u30a3u30f3u30c9u30a6u30eau30b5u30a4u30bau6642u306bu30e1u30cbu30e5u30fcu8868u793au3092u8abfu6574
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && mobileNav) {
      mobileNav.style.display = 'none'
      if (menuToggle) {
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>'
      }
      document.body.style.overflow = 'auto'
    }
  })
})
