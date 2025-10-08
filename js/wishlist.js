// Wishlist functionality
(function() {
    'use strict';

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://universalpine.com';

    const WISHLIST_API_URL = `${API_BASE_URL}/api/wishlist-count`;

    // ページロード時にカウントを取得して表示
    async function loadWishlistCount() {
        try {
            const response = await fetch(WISHLIST_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wishlist count');
            }

            const data = await response.json();
            updateCountDisplay(data.count);
        } catch (error) {
            console.error('Error loading wishlist count:', error);
            updateCountDisplay(0);
        }
    }

    // カウント表示を更新
    function updateCountDisplay(count) {
        const countElement = document.getElementById('wishlist-count');
        if (countElement) {
            const formattedCount = count.toLocaleString('ja-JP');
            countElement.textContent = `${formattedCount}人が欲しいと思っています。`;
        }
    }

    // ボタンクリック時の処理
    async function handleWishlistClick() {
        const button = document.getElementById('wishlist-button');

        // 既にクリック済みかチェック（localStorage使用）
        if (localStorage.getItem('wishlist_clicked') === 'true') {
            showMessage('既に「欲しい」を押しています', 'info');
            return;
        }

        // ボタンを無効化
        button.disabled = true;
        button.classList.add('clicked');

        try {
            const response = await fetch(WISHLIST_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update wishlist count');
            }

            const data = await response.json();
            updateCountDisplay(data.count);

            // クリック済みをlocalStorageに保存
            localStorage.setItem('wishlist_clicked', 'true');

            showMessage('ありがとうございます！', 'success');

        } catch (error) {
            console.error('Error updating wishlist:', error);
            showMessage('エラーが発生しました。もう一度お試しください。', 'error');
            button.disabled = false;
            button.classList.remove('clicked');
        }
    }

    // メッセージ表示
    function showMessage(message, type) {
        const countElement = document.getElementById('wishlist-count');
        const originalText = countElement.textContent;

        countElement.textContent = message;
        countElement.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#666';

        setTimeout(() => {
            countElement.style.color = '#666';
            if (type === 'success' || type === 'info') {
                // メッセージを元のカウント表示に戻す
                setTimeout(() => {
                    fetch(WISHLIST_API_URL)
                        .then(res => res.json())
                        .then(data => updateCountDisplay(data.count))
                        .catch(() => {
                            countElement.textContent = originalText;
                        });
                }, 500);
            }
        }, 2000);
    }

    // 初期化
    function init() {
        const button = document.getElementById('wishlist-button');

        if (!button) {
            console.error('Wishlist button not found');
            return;
        }

        // 既にクリック済みの場合、ボタンのスタイルを変更
        if (localStorage.getItem('wishlist_clicked') === 'true') {
            button.classList.add('clicked');
            button.disabled = true;
        }

        // イベントリスナーを追加
        button.addEventListener('click', handleWishlistClick);

        // カウントを読み込み
        loadWishlistCount();
    }

    // DOMContentLoaded時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
