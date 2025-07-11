// ニュースデータ管理
const newsData = [
    {
        date: '2025.06.20',
        title: 'エンジニア募集開始のお知らせ',
        category: 'info',
        categoryText: 'お知らせ',
        url: 'news/info/20250620.html'
    },
    {
        date: '2025.05.03',
        title: 'ホームページ公開について',
        category: 'info',
        categoryText: 'お知らせ',
        url: 'news/info/20250503.html'
    },
    {
        date: '2025.02.26',
        title: '新オフィス開設のお知らせ',
        category: 'info',
        categoryText: 'お知らせ',
        url: 'news/info/20250226-office.html'
    },
    {
        date: '2025.02.26',
        title: '会社設立のお知らせ',
        category: 'info',
        categoryText: 'お知らせ',
        url: 'news/info/20250226.html'
    }
];

// 日付を比較するためのヘルパー関数
function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
}

// 最新3件のニュースを取得
function getLatestNews(count = 3) {
    return newsData
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, count);
}

// ニュースHTMLを生成
function generateNewsHTML(news) {
    return `
        <div class="news-entry">
            <a href="${news.url}" class="news-link">
                <span class="news-date">${news.date}</span>
                <span class="news-title">${news.title}</span>
                <span class="news-category ${news.category}">${news.categoryText}</span>
                <span class="news-arrow"><i class="fas fa-chevron-right"></i></span>
            </a>
        </div>
    `;
}

// ニュースセクションを更新
function updateNewsSection() {
    const newsList = document.querySelector('#announcements .news-list');
    if (!newsList) return;

    const latestNews = getLatestNews(3);
    const newsHTML = latestNews.map(generateNewsHTML).join('');
    newsList.innerHTML = newsHTML;
}

// 新しいニュースを追加
function addNews(newsItem) {
    newsData.push(newsItem);
    // 日付順にソート
    newsData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    updateNewsSection();
}

// ページ読み込み時にニュースセクションを更新
document.addEventListener('DOMContentLoaded', function() {
    updateNewsSection();
});

// グローバル関数として公開（他のスクリプトから使用可能）
window.NewsManager = {
    addNews,
    updateNewsSection,
    getLatestNews
}; 