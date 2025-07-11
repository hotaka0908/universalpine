// ニュース管理用スクリプト
// 新しいニュースを追加する際のヘルパー関数

// 新しいニュースを追加する関数
function addNewNews(date, title, category = 'info', categoryText = 'お知らせ', url) {
    const newsItem = {
        date: date,
        title: title,
        category: category,
        categoryText: categoryText,
        url: url
    };
    
    // NewsManagerが利用可能な場合、自動的に追加
    if (window.NewsManager) {
        window.NewsManager.addNews(newsItem);
        console.log('新しいニュースが追加されました:', newsItem);
    } else {
        console.error('NewsManagerが見つかりません');
    }
}

// 使用例：
// addNewNews('2025.07.01', '新製品発表のお知らせ', 'info', 'お知らせ', 'news/info/20250701.html');

// ニュースデータをエクスポート（他のファイルから使用可能）
window.NewsAdmin = {
    addNewNews
}; 