import eslint from '@eslint/js';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', 'jest.config.js'],
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/**/*.test.js', 'src/**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_'}],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['src/**/*.test.js', 'src/**/*.spec.js', 'src/**/__tests__/setup.js', 'src/**/setup.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
        global: 'writable',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
];
