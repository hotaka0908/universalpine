// 基本的なAPIテスト - 手動実行用
// npm test または node tests/api-basic-test.js で実行

const fs = require('fs');
const path = require('path');

class APITester {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.tests = 0;
    this.passed = 0;
  }

  test(description, testFn) {
    this.tests++;
    try {
      testFn();
      this.passed++;
      console.log(`✅ ${description}`);
    } catch (error) {
      this.errors.push(`❌ ${description}: ${error.message}`);
      console.log(`❌ ${description}: ${error.message}`);
    }
  }

  warn(message) {
    this.warnings.push(`⚠️  ${message}`);
    console.log(`⚠️  ${message}`);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  fileContains(filePath, searchString) {
    if (!this.fileExists(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  }

  runTests() {
    console.log('🧪 Universal Pine API テスト開始\n');

    // APIファイルの存在確認
    ['contact.js', 'apply.js', 'trial.js', 'test.js'].forEach(file => {
      this.test(`api/${file} が存在する`, () => {
        this.assert(this.fileExists(`api/${file}`), `${file} ファイルが見つかりません`);
      });
    });

    // 環境変数の一貫性確認
    this.test('すべてのAPIファイルでRESEND_API_KEYを使用している', () => {
      const apiFiles = ['api/contact.js', 'api/apply.js', 'api/trial.js'];
      apiFiles.forEach(file => {
        if (this.fileExists(file)) {
          // resend_key の使用がないことを確認
          this.assert(!this.fileContains(file, 'resend_key'), 
            `${file} で古い環境変数名 'resend_key' が使用されています`);
        }
      });
    });

    // 統一されたパターンの確認
    this.test('すべてのAPIファイルで統一されたパターンを使用している', () => {
      const apiFiles = ['api/contact.js', 'api/apply.js', 'api/trial.js'];
      apiFiles.forEach(file => {
        if (this.fileExists(file)) {
          this.assert(this.fileContains(file, 'getResendClient'), 
            `${file} で getResendClient 関数が見つかりません`);
          this.assert(this.fileContains(file, 'setCorsHeaders'), 
            `${file} で setCorsHeaders 関数が見つかりません`);
        }
      });
    });

    // package.json の確認
    this.test('package.json に必要な依存関係が含まれている', () => {
      if (this.fileExists('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        this.assert(packageJson.dependencies && packageJson.dependencies.resend, 
          'package.json に resend 依存関係がありません');
        this.assert(packageJson.dependencies && packageJson.dependencies.zod, 
          'package.json に zod 依存関係がありません');
      }
    });

    // Vercel設定の確認
    this.test('vercel.json が適切に設定されている', () => {
      if (this.fileExists('vercel.json')) {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        this.assert(vercelConfig.functions && vercelConfig.functions['api/**/*.js'], 
          'vercel.json に API関数の設定がありません');
        this.assert(vercelConfig.functions['api/**/*.js'].runtime === 'nodejs20.x', 
          'vercel.json のランタイムが nodejs20.x ではありません');
      }
    });

    // ESLint設定の確認
    this.test('ESLint設定ファイルが存在する', () => {
      this.assert(this.fileExists('eslint.config.js'), 'eslint.config.js ファイルが見つかりません');
    });

    // GitHub Actions設定の確認
    this.test('GitHub Actions ワークフローが設定されている', () => {
      this.assert(this.fileExists('.github/workflows/eslint.yml'), 'ESLint ワークフローが見つかりません');
      this.assert(this.fileExists('.github/workflows/security-audit.yml'), 'セキュリティ監査ワークフローが見つかりません');
    });

    // 重複ファイルの確認
    if (this.fileExists('.eslintrc.json')) {
      this.warn('古い .eslintrc.json ファイルが存在します。eslint.config.js を使用しているため削除を検討してください。');
    }

    // 結果の表示
    console.log('\n📊 テスト結果:');
    console.log(`✅ 成功: ${this.passed}/${this.tests}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ エラー:');
      this.errors.forEach(error => console.log(error));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach(warning => console.log(warning));
    }

    if (this.errors.length === 0) {
      console.log('\n🎉 すべてのテストが成功しました！');
      return true;
    } else {
      console.log(`\n💥 ${this.errors.length} 個のエラーがあります。修正してください。`);
      return false;
    }
  }
}

// メイン実行
if (require.main === module) {
  const tester = new APITester();
  const success = tester.runTests();
  process.exit(success ? 0 : 1);
}

module.exports = APITester;