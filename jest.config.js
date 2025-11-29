/**
 * DAWLabs Monorepo Jest Configuration - Comprehensive Testing Framework Setup
 *
 * @context Root Jest configuration providing unified testing standards across the DAWLabs monorepo
 * @purpose Configures testing patterns, coverage collection, and reporting for all packages and applications
 * @integration Used by all packages and applications for consistent testing practices and CI/CD integration
 * @workflow Orchestrates test execution across workspaces with proper isolation and reporting
 *
 * Testing Strategy:
 * - Workspace-aware test discovery and execution
 * - Comprehensive coverage reporting with multiple output formats
 * - Optimized test patterns for different package types
 * - Integration with CI/CD pipelines for automated testing
 *
 * Configuration Features:
 * - Monorepo project support with isolated test environments
 * - JUnit XML reporting for CI/CD integration
 * - Coverage collection and reporting with detailed metrics
 * - Flexible test pattern matching for various test file conventions
 * - Performance optimization with smart ignore patterns
 *
 * Test Discovery Patterns:
 * - __tests__ directories for unit and integration tests
 * - .test and .spec file suffixes for focused testing
 * - src directory scanning for logical code organization
 * - Package and application separation for proper test isolation
 *
 * Coverage Reporting:
 * - HTML reports for detailed coverage analysis
 * - Text summaries for quick coverage overview
 * - JUnit XML for CI/CD pipeline integration
 * - Threshold enforcement for quality gates
 *
 * Performance Optimizations:
 * - Intelligent ignore patterns to exclude non-test files
 * - Parallel test execution across package boundaries
 * - Cached test execution with Turborepo integration
 * - Optimized test discovery algorithms
 *
 * @example
 * // Run all tests with coverage
 * npm run test:coverage
 *
 * // Run specific package tests
 * npm run test -- packages/ncurl
 *
 * // Generate JUnit reports for CI/CD
 * npm run test -- --ci --reporters=default --reporters=jest-junit
 */

/** @type {import('jest').Config} */
import baseConfig from './config/jest.config.base.js';

export default {
  ...baseConfig,

  // Monorepo specific
  displayName: 'dawlabs-monorepo',
  projects: [
    // This will be overridden by individual package jest configs
    // Individual packages will reference appropriate base configs
  ],

  // Workspace-wide configuration
  coverageDirectory: 'coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
      },
    ],
  ],

  // Workspace patterns
  testMatch: [
    '<rootDir>/packages/*/src/**/__tests__/**/*.{ts,js}',
    '<rootDir>/packages/*/src/**/*.test.{ts,js}',
    '<rootDir>/packages/*/src/**/*.spec.{ts,js}',
    '<rootDir>/apps/*/src/**/*.test.{ts,js}',
    '<rootDir>/apps/*/src/**/*.spec.{ts,js}',
  ],

  // Ignore patterns for monorepo
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.turbo/',
    '/target/', // Rust/NAPI
  ],
};
