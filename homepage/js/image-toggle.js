document.addEventListener('DOMContentLoaded', function() {
    const normalBtn = document.getElementById('normal-btn');
    const funBtn = document.getElementById('fun-btn');
    const normalImage = document.getElementById('hero-image');
    const funImage = document.getElementById('hero-image-fun');

    // Serious画像表示ボタンのクリックイベント
    normalBtn.addEventListener('click', function() {
        // ボタンのアクティブ状態を切り替え
        normalBtn.classList.add('active');
        funBtn.classList.remove('active');
        
        // 画像の表示/非表示を切り替え
        normalImage.classList.add('active');
        normalImage.classList.remove('hidden');
        funImage.classList.add('hidden');
        funImage.classList.remove('active');
    });

    // Fun画像表示ボタンのクリックイベント
    funBtn.addEventListener('click', function() {
        // ボタンのアクティブ状態を切り替え
        funBtn.classList.add('active');
        normalBtn.classList.remove('active');
        
        // 画像の表示/非表示を切り替え
        funImage.classList.add('active');
        funImage.classList.remove('hidden');
        normalImage.classList.add('hidden');
        normalImage.classList.remove('active');
    });
});
