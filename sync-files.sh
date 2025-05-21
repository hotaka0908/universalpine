#!/bin/bash

# 両方の環境間でファイルを同期するスクリプト

# 静的HTMLディレクトリからNext.jsのpublicディレクトリへの同期
sync_static_to_nextjs() {
  echo "静的HTMLディレクトリからNext.jsのpublicディレクトリへ同期中..."
  rsync -av --exclude=".DS_Store" --exclude="node_modules" --exclude=".next" --exclude=".vercel" --exclude="app" --exclude="next*" --exclude="package*" --exclude="tsconfig.json" /Users/funahashihotaka/universalpine/homepage/ /Users/funahashihotaka/universalpine/nextjs-app/public/
  echo "同期完了！"
}

# Next.jsのpublicディレクトリから静的HTMLディレクトリへの同期
sync_nextjs_to_static() {
  echo "Next.jsのpublicディレクトリから静的HTMLディレクトリへ同期中..."
  rsync -av --exclude=".DS_Store" --exclude="node_modules" /Users/funahashihotaka/universalpine/nextjs-app/public/ /Users/funahashihotaka/universalpine/homepage/
  echo "同期完了！"
}

# 引数に基づいて同期方向を決定
if [ "$1" == "to-nextjs" ]; then
  sync_static_to_nextjs
elif [ "$1" == "to-static" ]; then
  sync_nextjs_to_static
else
  echo "使用方法: ./sync-files.sh [to-nextjs|to-static]"
  echo "  to-nextjs: 静的HTMLディレクトリからNext.jsのpublicディレクトリへ同期"
  echo "  to-static: Next.jsのpublicディレクトリから静的HTMLディレクトリへ同期"
  exit 1
fi
