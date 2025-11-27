import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.js'],
    ignores: ['src/**/*.test.js', 'src/**/*.spec.js', 'test/**/*'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly', // CLI tools use console
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off', // Allow console in CLI tools
      'prefer-const': 'error',
      'no-var': 'error',
      'eol-last': 'error', // Ensure newlines at end of files
    },
  },
  {
    files: ['src/**/*.test.js', 'src/**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '*.min.js',
      'test/**/*', // Exclude test files
      'tsup.config.*', // Exclude tsup config files
    ],
  },
];
