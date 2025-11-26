/**
 * DAWLabs Monorepo ESLint Configuration
 *
 * Main ESLint configuration for the DAWLabs monorepo that combines base rules,
 * TypeScript support, and appropriate ignores for build outputs and dependencies.
 * This configuration provides consistent code quality enforcement across all packages.
 *
 * @version 1.0.0
 * @author DAWLabs Team
 * @license MIT
 */

import baseConfig from './config/eslint.base.js';

/**
 * ESLint configuration array for the monorepo
 * Combines base JavaScript rules with TypeScript support and global ignores
 */
export default [
  // Base configuration includes JavaScript and TypeScript rules
  ...baseConfig,

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
    ],
  },
];
