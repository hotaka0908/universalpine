# Universal Pine API Documentation

## 概要

Universal PineのWebサイトで使用されるサーバーレスAPI関数のドキュメントです。すべてのAPIはVercelで動作し、統一されたパターンで実装されています。

## 共通機能

### 共通ユーティリティ

- **`utils/resend-client.js`**: 統一されたResendクライアント管理
- **`utils/api-helpers.js`**: 共通のAPI機能（CORS、バリデーション、エラーハンドリング）

### セキュリティ機能

- CORS設定
- リクエストバリデーション（Zod使用）
- セキュリティヘッダー
- エラーハンドリング

## API エンドポイント

### 1. お問い合わせ (`/api/contact`)

**用途**: お問い合わせフォームの送信処理

**メソッド**: POST

**必須フィールド**:
- `name` (string): お名前
- `email` (string): メールアドレス
- `category` (string): カテゴリ
- `message` (string): メッセージ

**レスポンス例**:
```json
{
  "success": true,
  "message": "お問い合わせを受け付けました。",
  "data": {
    "emailId": "xxx-xxx-xxx"
  }
}
```

### 2. 採用応募 (`/api/apply`)

**用途**: 採用応募フォームの送信処理

**メソッド**: POST

**必須フィールド**:
- `name` (string): お名前
- `email` (string): メールアドレス
- `reason` (string): 応募理由

**任意フィールド**:
- `phone` (string): 電話番号
- `company` (string): 所属企業
- `position` (string): 役職
- `experience` (string): 経験年数

**レスポンス例**:
```json
{
  "success": true,
  "message": "応募を受け付けました。",
  "data": {
    "emailId": "xxx-xxx-xxx"
  }
}
```

### 3. プロジェクト体験予約 (`/api/trial`)

**用途**: プロジェクト体験の予約申し込み処理

**メソッド**: POST

**必須フィールド**:
- `name` (string): 名前
- `email` (string): メールアドレス
- `date` (string): 希望日付
- `time` (string): 希望時間
- `participants` (string): 参加人数
- `interests` (string): 関心のある職種

**任意フィールド**:
- `message` (string): メッセージ

**特徴**:
- 申込者への確認メール自動送信
- 管理者への通知メール送信

**レスポンス例**:
```json
{
  "success": true,
  "message": "プロジェクト体験の申し込みを受け付けました。確認メールをお送りいたします。",
  "data": {
    "emailId": "xxx-xxx-xxx"
  }
}
```

### 4. テスト用API (`/api/test`)

**用途**: API動作確認・デバッグ用

**メソッド**: GET

**機能**:
- 環境変数の存在確認
- APIの基本動作確認

## 環境変数

以下の環境変数が必要です：

- `RESEND_API_KEY`: Resendのメール送信APIキー（必須）
- `NODE_ENV`: 実行環境（development/production）

### Vercel での設定方法

```bash
# Vercel ダッシュボードで設定、またはCLIで設定
vercel env add RESEND_API_KEY
```

### Resend APIキーの取得

1. [Resend](https://resend.com/)にアカウントを作成
2. ダッシュボードから[APIキーを生成](https://resend.com/api-keys)
3. Vercelの環境変数として設定

### ドメインの設定（本番環境）

本番環境で独自ドメインからメールを送信するには：

1. Resendダッシュボードでドメインを追加
2. DNSレコードを設定してドメインを認証
3. 認証が完了したら、そのドメインからメールを送信可能

## エラーハンドリング

### 共通エラーレスポンス形式

```json
{
  "error": "エラータイプ",
  "message": "ユーザー向けエラーメッセージ",
  "details": "開発環境でのみ表示される詳細情報"
}
```

### 一般的なエラーコード

- `400`: バリデーションエラー、不正なリクエスト
- `405`: 許可されていないHTTPメソッド
- `500`: サーバー内部エラー

## 開発・テスト

### ローカル開発

```bash
# 依存関係インストール
npm install

# 環境変数設定
# .envファイルでRESEND_API_KEYを設定

# 開発サーバー起動
npm run dev
```

### API テスト

```bash
# お問い合わせAPIのテスト
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "テスト太郎",
    "email": "test@example.com",
    "category": "一般お問い合わせ",
    "message": "テストメッセージです"
  }'
```

## セキュリティ

- すべてのAPIで入力値バリデーション実装
- CORS適切に設定
- セキュリティヘッダー設定
- 環境変数での機密情報管理
- エラー情報の適切な制御

## 注意事項

- `RESEND_API_KEY`が設定されていない場合、メールは送信されませんが、APIはエラーを返しません（開発環境での動作継続のため）
- 本番環境では必ずRESEND_API_KEYを設定してください
- すべてのフォーム送信は非同期で処理されます