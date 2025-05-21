#!/bin/bash

# 静的HTMLサーバーを起動するスクリプト

cd /Users/funahashihotaka/universalpine/homepage

# http-serverがインストールされているか確認
if ! command -v npx &> /dev/null; then
  echo "npxが見つかりません。Node.jsとnpmがインストールされているか確認してください。"
  exit 1
fi

echo "静的HTMLサーバーを起動しています..."
echo "ブラウザで http://localhost:8080 を開いてアクセスしてください"
echo "サーバーを停止するには Ctrl+C を押してください"

# HTTPサーバーを起動
npx http-server -p 8080
