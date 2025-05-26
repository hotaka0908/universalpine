document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile menu script loaded');
    // ハンバーガーメニューの要素を取得
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const mobileNav = document.querySelector('.mobile-nav');
    let mobileNavActive = false;
    
    // ×ボタンの作成と追加
    const closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    closeButton.style.zIndex = '1001';
    closeButton.style.display = 'none';
    mobileNav.appendChild(closeButton);
    console.log('Close button added');
    
    // ハンバーガーメニューの開閉
    menuToggle.addEventListener('click', function(e) {
        console.log('Menu toggle clicked');
        e.stopPropagation();
        nav.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavActive = !mobileNavActive;
        closeButton.style.display = mobileNavActive ? 'block' : 'none';
    });
    
    // ×ボタンでメニューを閉じる
    closeButton.addEventListener('click', function(e) {
        console.log('Close button clicked');
        e.stopPropagation();
        nav.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavActive = false;
        closeButton.style.display = 'none';
        
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
    console.log('Found mobile dropdowns:', mobileDropdowns.length);
    
    mobileDropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        let dropdownActive = false; // ドロップダウンの状態を追跡
        
        link.addEventListener('click', function(e) {
            console.log('Dropdown link clicked');
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
                console.log('Dropdown sublink clicked');
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
            console.log('Closing menu from outside click');
            nav.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavActive = false;
            closeButton.style.display = 'none';
            
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
            
            // すべてのアコーディオンを閉じる
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
});
