document.addEventListener('DOMContentLoaded', function() {
    // ハンバーガーメニューの要素を取得
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;
    
    // 必要な要素が存在しない場合は早期リターン
    if (!menuToggle || !mobileNav) {
        console.warn('Mobile menu elements not found:', { menuToggle, mobileNav });
        return;
    }
    
    let mobileNavActive = false;
    
    // ハンバーガーメニューの開閉
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = mobileNav.classList.contains('active');
        
        if (isActive) {
            // メニューを閉じる
            closeMenu();
        } else {
            // メニューを開く
            openMenu();
        }
    });
    
    // メニューを開く関数
    function openMenu() {
        mobileNav.style.display = 'block';
        // 少し遅延させてアニメーションを有効にする
        requestAnimationFrame(() => {
            mobileNav.classList.add('active');
        });
        mobileNavActive = true;
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.width = '100%';
        menuToggle.textContent = '✕';
        
        // ARIA属性の更新
        menuToggle.setAttribute('aria-expanded', true);
        menuToggle.setAttribute('aria-label', 'メニューを閉じる');
        
        // フォーカス管理
        setTimeout(() => {
            const firstLink = mobileNav.querySelector('a');
            firstLink?.focus();
        }, 100);
    }
    
    // メニューを閉じる関数
    function closeMenu() {
        mobileNav.classList.remove('active');
        mobileNavActive = false;
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
        menuToggle.textContent = '☰';
        
        // ARIA属性の更新
        menuToggle.setAttribute('aria-expanded', false);
        menuToggle.setAttribute('aria-label', 'メニューを開く');
        
        // 全てのドロップダウンを閉じる
        const activeDropdowns = mobileNav.querySelectorAll('.dropdown.active');
        activeDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            // CSSの回転で制御するため、アイコンの内容は変更しない
        });
        
        // アニメーション後にdisplay: noneを設定
        setTimeout(() => {
            if (!mobileNavActive) {
                mobileNav.style.display = 'none';
            }
        }, 300);
        
        // フォーカスをメニューボタンに戻す
        menuToggle.focus();
    }
    
    
    // モバイルナビをクリックしても閉じないようにする
    mobileNav.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // ドロップダウンメニューの処理
    const mobileDropdowns = document.querySelectorAll('.mobile-nav .dropdown');
    
    mobileDropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        // ドロップダウンアイコンを追加
        if (!link.querySelector('.dropdown-icon')) {
            const icon = document.createElement('span');
            icon.className = 'dropdown-icon';
            icon.textContent = '〉';
            link.appendChild(icon);
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isCurrentlyActive = dropdown.classList.contains('active');
            
            // 他のドロップダウンを閉じる
            mobileDropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                // CSSの回転で制御するため、アイコンの内容は変更しない
                }
            });
            
            // 現在のドロップダウンをトグル
            if (isCurrentlyActive) {
                dropdown.classList.remove('active');
                // CSSの回転で制御するため、アイコンの内容は変更しない
            } else {
                dropdown.classList.add('active');
                // CSSの回転で制御するため、アイコンの内容は変更しない
            }
        });
        
        // ドロップダウン内のサブメニューリンクのクリック処理
        const subLinks = dropdown.querySelectorAll('.dropdown-content a');
        subLinks.forEach(subLink => {
            subLink.addEventListener('click', function(e) {
                e.stopPropagation();
                // サブメニューをクリックしたらモバイルナビを閉じる
                closeMenu();
            });
        });
    });
    
    // 通常のメニューリンク（ドロップダウンでない）のクリック処理
    const normalLinks = mobileNav.querySelectorAll('li:not(.dropdown) > a');
    normalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 通常のリンクをクリックしたらモバイルナビを閉じる
            closeMenu();
        });
    });
    
    // 画面外をクリックしたらメニューを閉じる
    document.addEventListener('click', function(e) {
        const isClickInsideMenu = e.target.closest('.mobile-nav') !== null;
        const isClickOnMenuToggle = e.target.closest('.menu-toggle') !== null;
        
        if (mobileNavActive && !isClickInsideMenu && !isClickOnMenuToggle) {
            closeMenu();
        }
    });
    
    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNavActive) {
            closeMenu();
        }
    });
    
    // 画面サイズ変更時の処理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileNavActive) {
            closeMenu();
        }
    });
});
