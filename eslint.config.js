// eslint.config.js - ESLint v9 用の設定ファイル
export default [
  {
    files: ['**/*.js'],
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
