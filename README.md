# Universal Pine

静的HTMLで構築したコーポレートサイト。

**本番URL** [https://universalpine.com](https://universalpine.com)

## 開発(ローカルプレビュー)

```bash
npm install # 必要な場合
npm run dev # または live-server .
```

## 画像最適化

大きな画像ファイルを最適化するには：

```bash
# ImageMagickをインストール（初回のみ）
brew install imagemagick

# 画像最適化を実行
./optimize-images.sh
```

## プロジェクト構造

```
universalpine/
├── homepage/          # 静的HTMLファイル
├── api/              # サーバーサイドAPI
├── deploy-package/   # デプロイ用パッケージ
├── upload-package/   # アップロード用パッケージ
└── vercel.json       # Vercel設定
```

## セキュリティ

- CSP（Content Security Policy）を実装
- XSS対策、クリックジャッキング対策
- 適切なセキュリティヘッダーを設定

## パフォーマンス

- 画像の遅延読み込み
- WebP形式での画像最適化
- レスポンシブデザイン対応
