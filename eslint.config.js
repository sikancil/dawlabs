/**
 * DAWLabs Monorepo ESLint Configuration - Unified Code Quality Enforcement
 *
 * @context Root ESLint configuration providing consistent code quality standards across the DAWLabs monorepo
 * @purpose Enforces unified coding practices, TypeScript support, and appropriate linting rules for all packages and tools
 * @integration Used throughout the monorepo by all packages, tools, and applications for automated code quality checking
 * @workflow Combines base configuration with package-specific overrides and comprehensive ignore patterns
 *
 * Configuration Strategy:
 * - Base configuration: Inherits from eslint.base.js with JavaScript and TypeScript rules
 * - Package-specific overrides: Customized rules for different package types and use cases
 * - Global ignores: Comprehensive patterns to exclude build outputs, dependencies, and generated files
 * - Workspace integration: Seamless integration with Turborepo and multi-package development
 *
 * Key Features:
 * - TypeScript support with type checking and modern ES features
 * - Specialized rules for CLI tools allowing console output for user interaction
 * - Package-specific configuration inheritance and customization
 * - Comprehensive ignore patterns for build artifacts and dependencies
 * - Optimized for monorepo development with proper workspace handling
 *
 * Override Categories:
 * - CLI Tools: Relaxed console restrictions for interactive tools
 * - Libraries: Strict linting for reusable components
 * - Applications: Balanced rules for production applications
 * - Templates: Configurable rules for generated template files
 *
 * Integration Points:
 * - Turborepo task orchestration and caching
 * - Pre-commit hooks with lint-staged integration
 * - IDE integration with VSCode ESLint extension
 * - CI/CD pipeline quality gates
 *
 * Performance Considerations:
 * - Optimized ignore patterns to reduce scanning overhead
 * - Incremental linting with file change detection
 * - Parallel execution support across package boundaries
 *
 * @example
 * // Usage in CI/CD pipeline
 * npx eslint . --ext .js,.ts --fix
 *
 * // Package-specific override example
 * // tools/my-tool/.eslintrc.js would extend this base config
 */

import baseConfig from './config/eslint.base.js';

/**
 * ESLint configuration array for the monorepo
 * Combines base JavaScript rules with TypeScript support and global ignores
 */
export default [
  // Base configuration includes JavaScript and TypeScript rules
  ...baseConfig,

  // Override rules for internal CLI tools (allow console statements for CLI functionality)
  {
    files: ['tools/internal-cli/**/*.{js,ts}'],
    rules: {
      'no-console': 'off', // CLI tools need console output
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ], // Allow unused variables/parameters with underscore prefix
    },
  },

  // TypeScript config is included in the base configuration
  // NestJS-specific configurations should be applied at the package level

  /**
   * Global ignore patterns for the entire monorepo
   * These patterns prevent ESLint from scanning build outputs, dependencies,
   * and generated files across all workspaces
   */
  {
    ignores: [
      '**/node_modules/**', // Package dependencies
      '**/dist/**', // Distribution build outputs
      '**/build/**', // Build artifacts
      '**/coverage/**', // Test coverage reports
      '**/*.min.js', // Minified JavaScript files
      '**/temp/**', // Temporary directories
      '**/.turbo/**', // Turborepo cache directories
      '**/packages/*/dist/**', // Package-specific dist directories
      '**/packages/*/build/**', // Package-specific build directories
      '**/apps/*/dist/**', // Application-specific dist directories
      '**/tools/create-dawlabs-package/templates/**', // Template files with placeholders
      '**/packages/*/test/**', // Test directories not in tsconfig
      '**/packages/*/tsup.config.*', // Tsup config files not in tsconfig
      '**/packages/*/jest.config.*', // Jest config files
      '**/packages/*/.vscode/**', // VSCode config
      '**/packages/*/.git/**', // Git directories
    ],
  },
];
