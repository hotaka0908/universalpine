#!/bin/bash

# 画像最適化スクリプト
# 大きな画像ファイルをWebP形式に変換し、サイズを最適化します

echo "画像最適化を開始します..."

# ImageMagickがインストールされているか確認
if ! command -v convert &> /dev/null; then
  echo "ImageMagickがインストールされていません。"
  echo "インストール方法: brew install imagemagick"
  exit 1
fi

cd homepage/images

# 大きな画像ファイルをWebPに変換
echo "大きな画像ファイルをWebP形式に変換中..."

# me.jpg (11MB) を最適化
if [ -f "me.jpg" ]; then
  echo "me.jpg を最適化中..."
  convert "me.jpg" -quality 85 -resize 1200x1200^ -gravity center -extent 1200x1200 "me-optimized.webp"
  echo "me.jpg -> me-optimized.webp (完了)"
fi

# main.jpg (9.7MB) を最適化
if [ -f "main.jpg" ]; then
  echo "main.jpg を最適化中..."
  convert "main.jpg" -quality 85 -resize 1920x1080^ -gravity center -extent 1920x1080 "main-optimized.webp"
  echo "main.jpg -> main-optimized.webp (完了)"
fi

# hello.png (2.8MB) を最適化
if [ -f "hello.png" ]; then
  echo "hello.png を最適化中..."
  convert "hello.png" -quality 85 "hello-optimized.webp"
  echo "hello.png -> hello-optimized.webp (完了)"
fi

# model3.png (1.6MB) を最適化
if [ -f "model3.png" ]; then
  echo "model3.png を最適化中..."
  convert "model3.png" -quality 85 "model3-optimized.webp"
  echo "model3.png -> model3-optimized.webp (完了)"
fi

# app-2.png (1.7MB) を最適化
if [ -f "app-2.png" ]; then
  echo "app-2.png を最適化中..."
  convert "app-2.png" -quality 85 "app-2-optimized.webp"
  echo "app-2.png -> app-2-optimized.webp (完了)"
fi

# anytime.png (1.9MB) を最適化
if [ -f "anytime.png" ]; then
  echo "anytime.png を最適化中..."
  convert "anytime.png" -quality 85 "anytime-optimized.webp"
  echo "anytime.png -> anytime-optimized.webp (完了)"
fi

# with2.png (1.4MB) を最適化
if [ -f "with2.png" ]; then
  echo "with2.png を最適化中..."
  convert "with2.png" -quality 85 "with2-optimized.webp"
  echo "with2.png -> with2-optimized.webp (完了)"
fi

# device.png (1.4MB) を最適化
if [ -f "device.png" ]; then
  echo "device.png を最適化中..."
  convert "device.png" -quality 85 "device-optimized.webp"
  echo "device.png -> device-optimized.webp (完了)"
fi

echo "画像最適化が完了しました！"
echo ""
echo "最適化されたファイル:"
ls -la *.webp 2>/dev/null || echo "WebPファイルが見つかりません"

echo ""
echo "注意: 最適化されたWebPファイルを使用するには、HTMLファイルのimgタグを更新してください。"
echo "例: <img src=\"images/me.jpg\" alt=\"...\"> -> <img src=\"images/me-optimized.webp\" alt=\"...\">" 