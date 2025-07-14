# Universal Pine API

このディレクトリには、Universal Pineのサーバーサイドエンドポイントが含まれています。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定してください：

```bash
cp .env.example .env
```

#### 必要な環境変数

- `resend_key`: Resendのメール送信APIキー

### 3. Resend APIキーの取得

1. [Resend](https://resend.com/)にアカウントを作成
2. ダッシュボードから[APIキーを生成](https://resend.com/api-keys)
3. `.env`ファイルに追加：

   ```
   resend_key=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 4. ドメインの設定（本番環境）

本番環境で<noreply@universalpine.com>からメールを送信するには：

1. Resendダッシュボードでドメインを追加
2. DNSレコードを設定してドメインを認証
3. 認証が完了したら、そのドメインからメールを送信可能

## APIエンドポイント

### `/api/contact` - お問い合わせフォーム

- メソッド: POST
- 用途: お問い合わせフォームの送信
- メール送信先: <ho@universalpine.com>

### `/api/trial` - プロジェクト体験予約

- メソッド: POST
- 用途: プロジェクト体験の予約申し込み
- メール送信先: <ho@universalpine.com>

### `/api/apply` - 採用応募

- メソッド: POST
- 用途: 採用への応募
- メール送信先: 設定による

## 開発時の注意

- `resend_key`が設定されていない場合、メールは送信されませんが、APIはエラーを返しません（開発環境での動作のため）
- コンソールにフォームデータが出力されます
