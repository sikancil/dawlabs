import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
  {
    // JavaScript with NestJS decorators - limited linting due to decorator syntax
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Only basic rules that work with decorator syntax
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '*.min.js',
      '**/*.config.ts',
      '**/*.config.js',
      '**/__tests__/**',
      '**/*.test.js',
      '**/*.spec.js',
      'src/**', // JavaScript with decorators - exclude from ESLint
    ],
  },
];
