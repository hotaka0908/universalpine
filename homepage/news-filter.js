document.addEventListener('DOMContentLoaded', function () {
  // フィルタータブの要素を取得
  const filterTabs = document.querySelectorAll('.filter-tab')
  // ニュースアイテムの要素を取得
  const newsItems = document.querySelectorAll('.news-item')

  // 各フィルタータブにクリックイベントを追加
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // アクティブなタブのクラスを削除
      filterTabs.forEach(t => t.classList.remove('active'))
      // クリックされたタブをアクティブにする
      this.classList.add('active')

      // フィルターの種類を取得
      const filter = this.getAttribute('data-filter')

      // 各ニュースアイテムを表示/非表示
      newsItems.forEach(item => {
        if (filter === 'all') {
          // 「すべて」の場合は全て表示
          item.style.display = 'grid'
        } else {
          // カテゴリーが一致するか確認
          const category = item.getAttribute('data-category')
          if (category === filter) {
            item.style.display = 'grid'
          } else {
            item.style.display = 'none'
          }
        }
      })
    })
  })
})
