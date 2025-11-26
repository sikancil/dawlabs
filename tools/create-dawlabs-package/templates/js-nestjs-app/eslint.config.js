import eslint from '@eslint/js';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', 'jest.config.js'],
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/**/*.test.js', 'src/**/*.spec.js', 'src/main.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          experimentalDecorators: true,
          legacyDecorators: true,
        },
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eol-last': 'error',
    },
  },
  {
    files: ['src/main.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          experimentalDecorators: true,
          legacyDecorators: true,
        },
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eol-last': 'error',
    },
  },
  {
    files: ['src/**/*.test.js', 'src/**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          experimentalDecorators: true,
          legacyDecorators: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'eol-last': 'error',
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          experimentalDecorators: true,
          legacyDecorators: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'eol-last': 'error',
    },
  },
];
