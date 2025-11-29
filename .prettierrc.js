/**
 * DAWLabs Monorepo Prettier Configuration - Unified Code Formatting Standards
 *
 * @context Root Prettier configuration providing consistent code formatting across the DAWLabs monorepo
 * @purpose Establishes unified code style, formatting rules, and editor integration patterns for all packages, tools, and applications
 * @integration Used throughout the monorepo by IDE plugins, pre-commit hooks, and CI/CD pipelines for automated code formatting
 * @workflow Enforces consistent formatting patterns during development, Git operations, and build processes with Turborepo integration
 *
 * Formatting Strategy:
 * - JavaScript/TypeScript: Modern ES standards with consistent spacing and quote usage
 * - JSON/YAML: Structured data formatting with appropriate line width and indentation
 * - Markdown: Readable prose formatting with consistent wrap and spacing rules
 * - HTML: Template formatting with broader line width for template readability
 *
 * Integration Points:
 * - Pre-commit hooks with lint-staged for automatic formatting before commits
 * - IDE integration with VSCode Prettier extension and format-on-save
 * - CI/CD pipeline validation ensuring consistent formatting across changes
 * - Turborepo format command for bulk formatting operations
 *
 * Override Categories:
 * - Configuration files (JSON/YAML): Optimized for readability and Git diffing
 * - Documentation files (Markdown): Prose-optimized formatting for documentation
 * - Template files (HTML): Template-friendly formatting for better template editing
 *
 * Performance Considerations:
 * - File-specific overrides prevent unnecessary processing of unrelated file types
 * - Optimized line widths for different content types (code vs. documentation)
 * - Consistent tab usage across all file types for uniform indentation
 *
 * @example
 * // Apply formatting to entire monorepo
 * npm run format
 *
 * // Check formatting without modifying files
 * npm run format:check
 *
 * // Format specific directory
 * npx prettier --write packages/ncurl/src/**//*.js
 */

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
