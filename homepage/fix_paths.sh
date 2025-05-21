#!/bin/bash

# HTMLファイル内のパス参照を修正するスクリプト

# 対象となるHTMLファイル
HTML_FILES="about.html apply.html contact.html news.html product.html project.html recruit.html thanks.html"

for file in $HTML_FILES; do
  echo "Fixing paths in $file..."
  
  # CSSとJavaScriptのパスを修正
  sed -i '' 's|href="/style.css"|href="style.css"|g' "$file"
  sed -i '' 's|href="/responsive.css"|href="responsive.css"|g' "$file"
  sed -i '' 's|src="/config.js"|src="config.js"|g' "$file"
  sed -i '' 's|src="/script.js"|src="script.js"|g' "$file"
  sed -i '' 's|src="/responsive.js"|src="responsive.js"|g' "$file"
  sed -i '' 's|src="/apply.js"|src="apply.js"|g' "$file"
  sed -i '' 's|src="/news-filter.js"|src="news-filter.js"|g' "$file"
  
  # リンクのパスを修正
  sed -i '' 's|href="/"|href="index.html"|g' "$file"
  sed -i '' 's|href="/news.html|href="news.html|g' "$file"
  sed -i '' 's|href="/product.html|href="product.html|g' "$file"
  sed -i '' 's|href="/recruit.html|href="recruit.html|g' "$file"
  sed -i '' 's|href="/about.html|href="about.html|g' "$file"
  sed -i '' 's|href="/contact.html|href="contact.html|g' "$file"
  sed -i '' 's|href="/apply.html|href="apply.html|g' "$file"
  sed -i '' 's|href="/project.html|href="project.html|g' "$file"
  sed -i '' 's|href="/thanks.html|href="thanks.html|g' "$file"
  
  # 画像パスの修正
  sed -i '' 's|src="/images/|src="images/|g' "$file"
  sed -i '' 's|src="/assets/|src="assets/|g' "$file"
  
  echo "Done fixing $file"
done

echo "All files have been updated!"
