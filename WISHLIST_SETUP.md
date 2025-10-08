# Wishlist機能のセットアップ手順

## 概要
製品ページに「欲しい」ボタンを追加し、全ユーザー間でカウントを共有する機能です。

## Vercel KVのセットアップ

### 1. Vercel KVストアの作成

1. Vercelダッシュボードにログイン: https://vercel.com/dashboard
2. プロジェクトを選択: `universalpine`
3. 「Storage」タブをクリック
4. 「Create Database」をクリック
5. 「KV」を選択
6. データベース名を入力（例: `universalpine-kv`）
7. リージョンを選択（推奨: `iad1` - Washington, D.C.）
8. 「Create」をクリック

### 2. 環境変数の自動設定

1. 作成したKVストアの詳細ページで「Connect」ボタンをクリック
2. プロジェクト `universalpine` を選択
3. 「Connect」をクリック

これにより以下の環境変数が自動的に設定されます：
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. デプロイ

環境変数が設定されたら、変更をデプロイします：

```bash
git add .
git commit -m "Add wishlist feature with Vercel KV"
git push
```

Vercelが自動的にデプロイを開始します。

## 機能の仕様

### エンドポイント
- **GET** `/api/wishlist-count` - 現在のカウント数を取得
- **POST** `/api/wishlist-count` - カウントを1増やす

### フロントエンド
- ボタンクリック時にAPIを呼び出してカウントを増加
- localStorageで重複クリックを防止（同じブラウザで1回のみ）
- カウント数を「〇〇人が欲しいと思っています」形式で表示
- ハートアイコン付きのアニメーション

### スタイル
- 赤色のハートアイコン
- ホバー時に背景が赤くなるアニメーション
- クリック時にハートビートアニメーション

## ローカル開発

ローカルでテストする場合は、Vercel CLIを使用：

```bash
# Vercel CLIのインストール（未インストールの場合）
npm i -g vercel

# ローカル環境変数の取得
vercel env pull .env.local

# ローカル開発サーバーの起動
vercel dev
```

## トラブルシューティング

### カウントが増えない場合
1. Vercel KVが正しくセットアップされているか確認
2. 環境変数が正しく設定されているか確認
3. Vercelのログを確認: https://vercel.com/[your-account]/universalpine/logs

### ローカルで動作しない場合
1. `.env.local` ファイルが存在するか確認
2. `vercel dev` コマンドを使用しているか確認（`npm run dev` ではVercel環境変数が読み込まれません）

## ファイル構成

```
/api/wishlist-count.js    # APIエンドポイント
/js/wishlist.js            # フロントエンドロジック
/product.html              # ボタンとカウント表示の追加
/product-page.css          # ボタンのスタイル
```
