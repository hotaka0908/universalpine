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

// ニュースDOM要素を生成（XSS対策としてDOM APIを使用）
function createNewsElement(news) {
    const entry = document.createElement('div');
    entry.className = 'news-entry';

    const link = document.createElement('a');
    link.href = news.url;
    link.className = 'news-link';

    const date = document.createElement('span');
    date.className = 'news-date';
    date.textContent = news.date;

    const title = document.createElement('span');
    title.className = 'news-title';
    title.textContent = news.title;

    const category = document.createElement('span');
    category.className = `news-category ${news.category}`;
    category.textContent = news.categoryText;

    const arrow = document.createElement('span');
    arrow.className = 'news-arrow';
    const icon = document.createElement('i');
    icon.className = 'fas fa-chevron-right';
    arrow.appendChild(icon);

    link.appendChild(date);
    link.appendChild(title);
    link.appendChild(category);
    link.appendChild(arrow);
    entry.appendChild(link);

    return entry;
}

// ニュースセクションを更新
function updateNewsSection() {
    const newsList = document.querySelector('#announcements .news-list');
    if (!newsList) return;

    const latestNews = getLatestNews(3);

    // 既存の内容をクリア
    newsList.textContent = '';

    // DOM要素を追加
    latestNews.forEach(news => {
        newsList.appendChild(createNewsElement(news));
    });
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