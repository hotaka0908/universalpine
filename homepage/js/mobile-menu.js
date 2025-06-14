document.addEventListener('DOMContentLoaded', function() {
    // ハンバーガーメニューの要素を取得
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const mobileNav = document.querySelector('.mobile-nav');
    
    // 必要な要素が存在しない場合は早期リターン
    if (!menuToggle || !nav || !mobileNav) {
        return;
    }
    
    let mobileNavActive = false;
    
    // ×ボタンの作成と追加
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'メニューを閉じる');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    closeButton.style.zIndex = '1001';
    closeButton.style.display = 'none';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.padding = '10px';
    closeButton.style.minWidth = '44px';
    closeButton.style.minHeight = '44px';
    mobileNav.appendChild(closeButton);
    
    // ハンバーガーメニューの開閉
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        nav.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavActive = !mobileNavActive;
        closeButton.style.display = mobileNavActive ? 'block' : 'none';
        
        // ARIA属性の更新
        this.setAttribute('aria-expanded', mobileNavActive);
        this.setAttribute('aria-label', mobileNavActive ? 'メニューを閉じる' : 'メニューを開く');
        
        // フォーカス管理
        if (mobileNavActive) {
            // メニューが開いた時は最初のリンクにフォーカス
            const firstLink = mobileNav.querySelector('a');
            firstLink?.focus();
        }
    });
    
    // ×ボタンでメニューを閉じる
    closeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        nav.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavActive = false;
        closeButton.style.display = 'none';
        
        // ARIA属性の更新
        menuToggle.setAttribute('aria-expanded', false);
        menuToggle.setAttribute('aria-label', 'メニューを開く');
        
        // フォーカスをメニューボタンに戻す
        menuToggle.focus();
        
        // すべてのアコーディオンを閉じる
        document.querySelectorAll('.mobile-nav .accordion-item').forEach(item => {
            item.classList.remove('active');
        });
    });
    
    // モバイルナビをクリックしても閉じないようにする
    mobileNav.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // ドロップダウンメニューの処理
    const mobileDropdowns = document.querySelectorAll('.mobile-nav .dropdown');
    
    mobileDropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        let dropdownActive = false; // ドロップダウンの状態を追跡
        
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // イベントの伝播を停止してハンバーガーメニューが閉じないようにする
            
            // 必ずハンバーガーメニューが閉じないようにする
            e.preventDefault(); // リンクのデフォルト動作を常に防止
            
            // ドロップダウンの開閉状態を切り替える
            if (dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            } else {
                // 他のドロップダウンを閉じる
                mobileDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                        otherDropdown.classList.remove('active');
                    }
                });
                
                // クリックしたドロップダウンを開く
                dropdown.classList.add('active');
            }
        });
        
        // ドロップダウン内のリンクはそのままリンク先に移動させる
        const subLinks = dropdown.querySelectorAll('.dropdown-content a');
        subLinks.forEach(subLink => {
            subLink.addEventListener('click', function(subEvent) {
                // イベントの伝播を停止して親要素のイベントが発火しないようにする
                subEvent.stopPropagation();
                // サブメニューのリンクはそのままリンク先に移動させる（デフォルトの動作を許可）
            });
        });
    });
    
    // 画面外をクリックしたらメニューを閉じる
    document.addEventListener('click', function(e) {
        // クリックした要素がメニュー内の要素でない場合のみメニューを閉じる
        const isClickInsideMenu = e.target.closest('.mobile-nav') !== null;
        const isClickOnMenuToggle = e.target.closest('.menu-toggle') !== null;
        
        if (mobileNavActive && !isClickInsideMenu && !isClickOnMenuToggle) {
            nav.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavActive = false;
            closeButton.style.display = 'none';
            
            // ARIA属性の更新
            menuToggle.setAttribute('aria-expanded', false);
            menuToggle.setAttribute('aria-label', 'メニューを開く');
            
            // すべてのアコーディオンを閉じる
            document.querySelectorAll('.mobile-nav .accordion-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // 画面サイズ変更時の処理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavActive = false;
            closeButton.style.display = 'none';
            
            // ARIA属性の更新
            menuToggle.setAttribute('aria-expanded', false);
            menuToggle.setAttribute('aria-label', 'メニューを開く');
            
            // すべてのアコーディオンを閉じる
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
});
