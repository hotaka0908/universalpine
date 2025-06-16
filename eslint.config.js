// eslint.config.js - ESLint v9 用の設定ファイル
/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.js'],
    ignores: [
      'node_modules/**',
      '.next/**',
      'api/.next/**',
      'voice-chat-app/.next/**',
      'nextjs-app/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.vercel/**'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'prefer-template': 'error'
    }
  }
];
