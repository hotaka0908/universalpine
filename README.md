# Universal Pine - コーポレートサイト

AI技術を活用した革新的なネックレス型ウェアラブルデバイスを開発するUniversal Pineの公式コーポレートサイトです。

**本番URL**: [https://universalpine.com](https://universalpine.com)

## プロジェクト概要

Universal Pineは、AI技術を活用して人々の生活をより良くすることをミッションとする企業です。このプロジェクトは、静的HTMLとNode.js APIを組み合わせたハイブリッド構成で構築されています。

### 主要機能

- **レスポンシブデザイン**: モバイル、タブレット、デスクトップに対応
- **お問い合わせフォーム**: Resend APIを使用したメール送信機能
- **セキュリティ対策**: CSP、XSS対策、スパム対策（ハニーポット）、CORS制限
- **パフォーマンス最適化**: 画像最適化、遅延読み込み
- **アクセシビリティ**: WCAG準拠のマークアップ

## プロジェクト構造

```
universalpine/
├── index.html               # トップページ
├── about.html               # 会社情報
├── product.html             # 製品情報
├── contact.html             # お問い合わせ
├── recruit.html             # 採用情報
├── news.html                # ニュース
├── apply.html               # 採用応募フォーム
├── freetrial.html           # プロジェクト体験予約
├── thanks.html              # 送信完了ページ
├── privacy-policy.html      # プライバシーポリシー
├── jobsdetail.html          # 採用詳細
├── project.html             # プロジェクト情報
├── style.css                # メインCSS
├── script.js                # メインJavaScript
├── about/                   # 会社情報関連
│   └── message/             # 代表メッセージ
├── js/                      # JavaScriptファイル
│   ├── error-handler.js     # エラーハンドリング
│   ├── mobile-menu.js       # モバイルメニュー
│   └── news-data.js         # ニュースデータ
├── assets/                  # アセットファイル
│   ├── css/                 # CSSファイル
│   └── js/                  # JavaScriptファイル
├── images/                  # 画像ファイル
├── news/                    # ニュース記事
│   ├── info/                # お知らせ
│   └── press/               # プレスリリース
├── api/                     # サーバーサイドAPI
│   ├── contact.js           # お問い合わせAPI
│   ├── apply.js             # 採用応募API
│   ├── trial.js             # プロジェクト体験予約API
│   ├── wishlist-count.js    # ウィッシュリストカウントAPI
│   └── _lib/                # 共通ヘルパー
├── package.json             # Node.js依存関係
├── vercel.json              # Vercel設定
└── eslint.config.js         # ESLint設定
```

## 技術スタック

### フロントエンド

- **HTML5**: セマンティックマークアップ
- **CSS3**: レスポンシブデザイン、Flexbox、Grid
- **JavaScript (ES6+)**: バニラJS、モジュラー構成
- **Font Awesome**: アイコンライブラリ
- **Google Fonts**: Inter、Noto Sans JP

### バックエンド

- **Node.js 20.x**: サーバーサイドランタイム
- **Resend API**: メール送信サービス
- **Zod**: バリデーションライブラリ
- **Vercel KV**: キーバリューストア

### インフラ・デプロイ

- **Vercel**: ホスティング・デプロイメント
- **GitHub**: バージョン管理

## セットアップ・開発

### 前提条件

- Node.js 18.0.0以上
- npm

### 1. リポジトリのクローン

```bash
git clone https://github.com/hotaka0908/universalpine.git
cd universalpine
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、必要な環境変数を設定：

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. ローカル開発サーバーの起動

```bash
npm run dev
```

### 5. 開発用コマンド

```bash
# コード品質チェック
npm run lint

# セキュリティ監査
npm audit
```

## API エンドポイント

### お問い合わせフォーム (`/api/contact`)

- **メソッド**: POST
- **用途**: お問い合わせフォームの送信
- **機能**:
  - Zodによるバリデーション
  - スパム対策（ハニーポット）
  - CORS制限（universalpine.comのみ）

### 採用応募 (`/api/apply`)

- **メソッド**: POST
- **用途**: 採用への応募
- **機能**: 応募情報の処理、確認メール送信

### プロジェクト体験予約 (`/api/trial`)

- **メソッド**: POST
- **用途**: プロジェクト体験の予約申し込み
- **機能**: 予約情報の処理、確認メール送信

## セキュリティ機能

### CORS制限

- `universalpine.com`と`www.universalpine.com`のみ許可
- 外部サイトからのAPI呼び出しをブロック

### Content Security Policy (CSP)

- XSS攻撃の防止
- 外部リソースの制限
- `unsafe-eval`を無効化

### その他のセキュリティヘッダー

- `X-Frame-Options: DENY`: クリックジャッキング対策
- `X-Content-Type-Options: nosniff`: MIME型スニッフィング対策
- `Referrer-Policy`: リファラー情報の制御

### スパム対策

- ハニーポットフィールド（全フォーム）
- サーバーサイドバリデーション

## デプロイメント

### Vercel デプロイ

```bash
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

- `RESEND_API_KEY`: Resend APIキー
- `KV_REST_API_URL`: Vercel KV URL
- `KV_REST_API_TOKEN`: Vercel KV トークン

## ライセンス

UNLICENSED

## サポート

- **メール**: ho@universalpine.com
- **GitHub Issues**: [リポジトリのIssues](https://github.com/hotaka0908/universalpine/issues)

---

**最終更新**: 2025年12月27日
