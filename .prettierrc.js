/** @type {import('prettier').Config} */
export default {
  // Basic Formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  printWidth: 100,

  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: true,

  // NestJS and TypeScript specific
  experimentalTernaries: false,
  singleAttributePerLine: false,

  // Override patterns
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
  ],
};
