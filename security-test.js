#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// セキュリティテストスクリプト
console.log('🔒 Universal Pine セキュリティテストを開始します...\n');

const homepageDir = path.join(__dirname, 'homepage');

// HTMLファイルからセキュリティヘッダーをチェックする関数
function checkSecurityHeaders(htmlContent, filename) {
    const results = {
        filename,
        csp: false,
        xFrameOptions: false,
        xContentTypeOptions: false,
        referrerPolicy: false,
        permissionsPolicy: false,
        canonical: false,
        viewport: false,
        charset: false
    };
    
    // CSPチェック
    if (htmlContent.includes('Content-Security-Policy')) {
        results.csp = true;
    }
    
    // X-Frame-Optionsチェック
    if (htmlContent.includes('X-Frame-Options')) {
        results.xFrameOptions = true;
    }
    
    // X-Content-Type-Optionsチェック
    if (htmlContent.includes('X-Content-Type-Options')) {
        results.xContentTypeOptions = true;
    }
    
    // Referrer-Policyチェック
    if (htmlContent.includes('Referrer-Policy')) {
        results.referrerPolicy = true;
    }
    
    // Permissions-Policyチェック
    if (htmlContent.includes('Permissions-Policy')) {
        results.permissionsPolicy = true;
    }
    
    // Canonical URLチェック
    if (htmlContent.includes('rel="canonical"')) {
        results.canonical = true;
    }
    
    // Viewportチェック
    if (htmlContent.includes('viewport')) {
        results.viewport = true;
    }
    
    // Charsetチェック
    if (htmlContent.includes('charset="UTF-8"')) {
        results.charset = true;
    }
    
    return results;
}

// JavaScriptファイルのセキュリティチェック
function checkJavaScriptSecurity(jsContent, filename) {
    const results = {
        filename,
        eval: false,
        innerHTML: false,
        documentWrite: false,
        inlineScripts: false,
        externalScripts: false
    };
    
    // eval()の使用チェック
    if (jsContent.includes('eval(')) {
        results.eval = true;
    }
    
    // innerHTMLの使用チェック
    if (jsContent.includes('.innerHTML')) {
        results.innerHTML = true;
    }
    
    // document.writeの使用チェック
    if (jsContent.includes('document.write')) {
        results.documentWrite = true;
    }
    
    // 外部スクリプトの使用チェック
    if (jsContent.includes('https://') || jsContent.includes('http://')) {
        results.externalScripts = true;
    }
    
    return results;
}

// メインのセキュリティテスト関数
function runSecurityTests() {
    console.log('📄 HTMLファイルのセキュリティチェック:');
    console.log('=====================================');
    
    const htmlFiles = ['index.html', 'about.html', 'contact.html', 'product.html', 'recruit.html'];
    const htmlResults = [];
    
    htmlFiles.forEach(file => {
        const filePath = path.join(homepageDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = checkSecurityHeaders(content, file);
            htmlResults.push(result);
            
            console.log(`\n📄 ${file}:`);
            console.log(`   CSP: ${result.csp ? '✅' : '❌'}`);
            console.log(`   X-Frame-Options: ${result.xFrameOptions ? '✅' : '❌'}`);
            console.log(`   X-Content-Type-Options: ${result.xContentTypeOptions ? '✅' : '❌'}`);
            console.log(`   Referrer-Policy: ${result.referrerPolicy ? '✅' : '❌'}`);
            console.log(`   Permissions-Policy: ${result.permissionsPolicy ? '✅' : '❌'}`);
            console.log(`   Canonical URL: ${result.canonical ? '✅' : '❌'}`);
            console.log(`   Viewport: ${result.viewport ? '✅' : '❌'}`);
            console.log(`   Charset: ${result.charset ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`❌ ${file}: 読み込みエラー`);
        }
    });
    
    console.log('\n⚡ JavaScriptファイルのセキュリティチェック:');
    console.log('==========================================');
    
    const jsFiles = ['script.js', 'js/mobile-menu.js', 'js/image-toggle.js'];
    const jsResults = [];
    
    jsFiles.forEach(file => {
        const filePath = path.join(homepageDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = checkJavaScriptSecurity(content, file);
            jsResults.push(result);
            
            console.log(`\n⚡ ${file}:`);
            console.log(`   eval()使用: ${result.eval ? '⚠️' : '✅'}`);
            console.log(`   innerHTML使用: ${result.innerHTML ? '⚠️' : '✅'}`);
            console.log(`   document.write使用: ${result.documentWrite ? '⚠️' : '✅'}`);
            console.log(`   外部スクリプト: ${result.externalScripts ? 'ℹ️' : '✅'}`);
        } catch (error) {
            console.log(`❌ ${file}: 読み込みエラー`);
        }
    });
    
    console.log('\n🔍 追加セキュリティチェック:');
    console.log('==========================');
    
    // 環境変数ファイルのチェック
    const envFiles = ['.env', '.env.local', '.env.production'];
    envFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`⚠️  ${file}: 環境変数ファイルが存在します（.gitignoreに含まれているか確認してください）`);
        }
    });
    
    // APIファイルのチェック
    const apiDir = path.join(__dirname, 'api');
    if (fs.existsSync(apiDir)) {
        const apiFiles = fs.readdirSync(apiDir).filter(file => file.endsWith('.js'));
        console.log(`ℹ️  APIファイル数: ${apiFiles.length}`);
        apiFiles.forEach(file => {
            console.log(`   - ${file}`);
        });
    }
    
    console.log('\n📊 セキュリティスコア:');
    console.log('=====================');
    
    // HTMLセキュリティスコア計算
    const totalHtmlChecks = htmlResults.length * 8; // 8つのチェック項目
    const passedHtmlChecks = htmlResults.reduce((total, result) => {
        return total + Object.values(result).filter(Boolean).length - 1; // filenameを除く
    }, 0);
    const htmlScore = ((passedHtmlChecks / totalHtmlChecks) * 100).toFixed(1);
    
    console.log(`HTMLセキュリティ: ${htmlScore}% (${passedHtmlChecks}/${totalHtmlChecks})`);
    
    // JavaScriptセキュリティスコア計算
    const totalJsChecks = jsResults.length * 4; // 4つのチェック項目
    const passedJsChecks = jsResults.reduce((total, result) => {
        return total + Object.values(result).filter(val => val === false).length - 1; // filenameを除く
    }, 0);
    const jsScore = ((passedJsChecks / totalJsChecks) * 100).toFixed(1);
    
    console.log(`JavaScriptセキュリティ: ${jsScore}% (${passedJsChecks}/${totalJsChecks})`);
    
    console.log('\n🔒 セキュリティ改善提案:');
    console.log('========================');
    
    if (htmlScore < 100) {
        console.log('1. HTMLセキュリティヘッダーの追加:');
        console.log('   - 不足しているセキュリティヘッダーを追加');
        console.log('   - CSPの設定を最適化');
    }
    
    if (jsScore < 100) {
        console.log('2. JavaScriptセキュリティの改善:');
        console.log('   - eval()の使用を避ける');
        console.log('   - innerHTMLの代わりにtextContentを使用');
        console.log('   - 外部スクリプトの信頼性を確認');
    }
    
    console.log('3. 一般的なセキュリティ対策:');
    console.log('   - 定期的なセキュリティ監査');
    console.log('   - 依存関係の脆弱性チェック');
    console.log('   - HTTPSの強制');
    console.log('   - 適切なエラーハンドリング');
    
    console.log('\n✅ セキュリティテスト完了！');
}

// テスト実行
runSecurityTests(); 