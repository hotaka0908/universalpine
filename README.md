# Universal Pine - コーポレートサイト

AI技術を活用した革新的なネックレス型ウェアラブルデバイスを開発するUniversal Pineの公式コーポレートサイトです。

**本番URL**: [https://universalpine.com](https://universalpine.com)

## ⚠️ Vercel 設定ルール

### vercel.json ルーティングパターン

**✅ 推奨パターン (OK)**
```json
{
  "source": "/api/:path*",           // 正確なAPI routes
  "source": "/:path*.(css|js)",      // ファイル拡張子指定
  "source": "/(.*)",                 // 汎用パターン
}
```

**❌ 避けるべきパターン (NG)**
```json
{
  "source": "/api/(.*)",             // 正規表現は使用不可
  "source": "/(.*\\.(css|js))",      // エスケープ文字は使用不可
  "source": "/complex/regex/.*"      // 複雑な正規表現は使用不可
}
```

### 修正例
```json
// 修正前 (NG)
"source": "/(.*\\.(css|js))"

// 修正後 (OK)  
"source": "/:path*.(css|js)"
```

## 🚀 プロジェクト概要

Universal Pineは、AI技術を活用して人々の生活をより良くすることをミッションとする企業です。このプロジェクトは、静的HTMLとNode.js APIを組み合わせたハイブリッド構成で構築されています。

### 主要機能

- **レスポンシブデザイン**: モバイル、タブレット、デスクトップに対応
- **お問い合わせフォーム**: Resend APIを使用したメール送信機能
- **セキュリティ対策**: CSP、XSS対策、スパム対策（ハニーポット）
- **パフォーマンス最適化**: 画像最適化、遅延読み込み
- **アクセシビリティ**: WCAG準拠のマークアップ

## 📁 プロジェクト構造

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
├── *.css                   # ページ別CSS
├── script.js                # メインJavaScript
├── about/                   # 会社情報関連
│   └── message/            # 代表メッセージ
├── js/                      # JavaScriptファイル
│   ├── error-handler.js    # エラーハンドリング
│   ├── mobile-menu.js      # モバイルメニュー
│   ├── news-admin.js       # ニュース管理
│   └── news-data.js        # ニュースデータ
├── assets/                  # アセットファイル
│   ├── css/                # CSSファイル
│   └── js/                 # JavaScriptファイル
├── images/                  # 画像ファイル（最適化済み）
├── news/                    # ニュース記事
│   ├── info/               # お知らせ
│   └── press/              # プレスリリース
├── api/                     # サーバーサイドAPI
│   ├── contact.js           # お問い合わせAPI
│   ├── apply.js             # 採用応募API
│   ├── trial.js             # プロジェクト体験予約API
│   ├── test.js              # API共通テスト
│   ├── test-contact.js      # お問い合わせテスト用API
│   └── README.md            # API仕様書
├── tests/                   # テストファイル
│   └── api-basic-test.js   # APIベーシックテスト
├── deploy-package/          # デプロイ用パッケージ
├── upload-package/          # アップロード用パッケージ
├── package.json             # Node.js依存関係
├── vercel.json              # Vercel設定
├── eslint.config.js         # ESLint設定
├── optimize-images.sh       # 画像最適化スクリプト
├── start-static-server.sh   # 静的サーバー起動スクリプト
├── security-test.js         # セキュリティテスト
├── test-email-send.js       # メール送信テスト
└── README.md               # このファイル
```

## 🛠️ 技術スタック

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

### インフラ・デプロイ

- **Vercel**: ホスティング・デプロイメント
- **GitHub**: バージョン管理

### 開発ツール

- **ESLint**: コード品質チェック
- **http-server**: ローカル開発サーバー
- **Node.js テスト**: APIとセキュリティの基本テスト

## 🚀 セットアップ・開発

### 前提条件

- Node.js 18.0.0以上
- npm または yarn

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

`.env`ファイルを作成し、必要な環境変数を設定：

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. ローカル開発サーバーの起動

```bash
# 静的ファイルサーバー（ポート3000）
npm run dev

# または
./start-static-server.sh
```

### 5. 開発用コマンド

```bash
# コード品質チェック
npm run lint

# コード品質修正
npm run lint:fix

# セキュリティ監査
npm run audit

# セキュリティ修正
npm run audit:fix

# APIテストの実行
npm test
# または
npm run test:api

# ビルド（静的ファイルのため実際の処理なし）
npm run build
```

## 📧 API エンドポイント

### お問い合わせフォーム (`/api/contact`)

- **メソッド**: POST
- **用途**: お問い合わせフォームの送信
- **送信先**: <ho@universalpine.com>
- **機能**:
  - バリデーション（Zod）
  - スパム対策（ハニーポット）
  - 確認メール送信
  - CORS対応

### 採用応募 (`/api/apply`)

- **メソッド**: POST
- **用途**: 採用への応募
- **機能**: 応募情報の処理

### プロジェクト体験予約 (`/api/trial`)

- **メソッド**: POST
- **用途**: プロジェクト体験の予約申し込み
- **機能**: 予約情報の処理

### テスト用エンドポイント

- **`/api/test`**: API動作確認用
- **`/api/test-contact`**: お問い合わせ機能のテスト用

## 🔒 セキュリティ機能

### Content Security Policy (CSP)

- XSS攻撃の防止
- 外部リソースの制限
- インラインスクリプトの制限

### その他のセキュリティヘッダー

- `X-Frame-Options`: クリックジャッキング対策
- `X-Content-Type-Options`: MIME型スニッフィング対策
- `Referrer-Policy`: リファラー情報の制御
- `Permissions-Policy`: ブラウザ機能の制限

### スパム対策

- ハニーポットフィールド
- バリデーション強化
- レート制限（Vercel標準）

## 📊 パフォーマンス最適化

### 画像最適化

- **最適化済み画像**: 95%のサイズ削減を実現
- **遅延読み込み**: `loading="lazy"`属性
- **適切なフォーマット**: WebP、JPEG、PNGの使い分け

### ファイルサイズ

- **HTML**: 90.31 KB
- **CSS**: 45.36 KB
- **JavaScript**: 10.93 KB
- **画像**: 31.71 MB（最適化済み）

### 読み込み速度

- **ローカル**: 11ms
- **本番**: 361ms

## 🎨 デザイン・UX

### レスポンシブデザイン

- モバイルファーストアプローチ
- ブレークポイント: 768px, 1024px, 1200px
- タッチフレンドリーなUI

### アクセシビリティ

- WCAG 2.1準拠
- セマンティックHTML
- ARIA属性の適切な使用
- キーボードナビゲーション対応

### ブラウザ対応

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 分析・監視

### Microsoft Clarity

- ユーザー行動分析
- ヒートマップ
- セッション録画

### パフォーマンス監視

- Lighthouse CI
- Core Web Vitals
- ページ読み込み速度

## 🚀 デプロイメント

### Vercel デプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

- `RESEND_API_KEY`: Resend APIキー

## 🔧 メンテナンス

### 定期的なチェック項目

1. **セキュリティ監査**: 月1回

   ```bash
   npm audit
   ```

2. **依存関係の更新**: 月1回

   ```bash
   npm update
   ```

3. **APIテスト**: 新機能追加時

   ```bash
   npm test
   ```

4. **パフォーマンステスト**: 月1回
   - Lighthouse
   - PageSpeed Insights

5. **画像最適化**: 新規画像追加時

   ```bash
   ./optimize-images.sh
   ```

### 画像最適化

大きな画像ファイルを最適化するには：

```bash
# ImageMagickをインストール（初回のみ）
brew install imagemagick

# 画像最適化を実行
./optimize-images.sh
```

## 📝 開発ガイドライン

### コーディング規約

- **HTML**: セマンティックマークアップ、アクセシビリティ対応
- **CSS**: BEM命名規則、モバイルファースト
- **JavaScript**: ES6+、モジュラー構成、エラーハンドリング

### コミットメッセージ

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加
chore: その他の変更
```

## 🐛 トラブルシューティング

### よくある問題

1. **APIエンドポイントにアクセスできない**
   - CSP設定の確認
   - Vercelの環境変数設定確認

2. **メールが送信されない**
   - Resend APIキーの確認
   - 環境変数の設定確認

3. **画像が表示されない**
   - ファイルパスの確認
   - 画像ファイルの存在確認

## 📄 ライセンス

このプロジェクトは UNLICENSED ライセンスの下で公開されています。

## 👥 開発チーム

- **Universal Pine**: メイン開発
- **AI Assistant**: 技術サポート・最適化

## 📞 サポート

技術的な問題や質問がある場合は、以下までお問い合わせください：

- **メール**: <ho@universalpine.com>
- **GitHub Issues**: [リポジトリのIssues](https://github.com/hotaka0908/universalpine/issues)

---

**最終更新**: 2025年7月8日  
**バージョン**: 1.0.0
