/**
 * DAWLabs NestJS Jest Configuration - Comprehensive Testing Framework for NestJS Applications
 *
 * @context Specialized Jest configuration for NestJS applications within the DAWLabs monorepo
 * @purpose Provides comprehensive testing setup for NestJS applications including unit tests, e2e tests, and framework-specific optimizations
 * @integration Used by NestJS applications and plugins for automated testing, CI/CD pipelines, and development workflows
 * @workflow Extends base Jest configuration with NestJS-specific patterns, module resolution, and multi-project test execution
 *
 * NestJS Testing Strategy:
 * - Unit Tests: Fast isolated testing of individual components and services
 * - E2E Tests: Full application testing with real HTTP requests and database connections
 * - Integration Tests: Component interaction testing with dependency injection mocking
 * - Performance: Extended timeouts for NestJS application bootstrap and teardown
 *
 * Configuration Features:
 * - TypeScript Integration: ts-jest transformer with isolated modules for clean compilation
 * - Module Resolution: Comprehensive path mapping for NestJS project structure
 * - Test Patterns: Optimized file discovery for NestJS conventions (*.spec.ts, *.e2e-spec.ts)
 * - Coverage Collection: Framework-aware coverage excluding entry points and module definitions
 *
 * Project Structure:
 * - Unit Tests: Focused on individual services, controllers, and utilities
 * - E2E Tests: Full application testing with dedicated setup and longer timeouts
 * - Module Mapping: Consistent with NestJS path alias conventions (@/, @app/, @config/, @test/)
 * - Setup Files: Global test configuration for NestJS testing utilities
 *
 * Performance Optimizations:
 * - Isolated Modules: Clean TypeScript compilation without cross-file dependencies
 * - Selective Coverage: Excludes generated files, mocks, and boilerplate from coverage
 * - Extended Timeouts: Accommodates NestJS application lifecycle and dependency injection
 * - Parallel Execution: Separate projects for unit and e2e tests enable parallel processing
 *
 * Integration Points:
 * - Turborepo: Integrated with monorepo test execution and caching
 * - CI/CD: JUnit XML reporting for pipeline integration
 * - IDE Support: VSCode Jest extension for real-time test feedback
 * - Pre-commit: lint-staged integration for selective test execution
 *
 * @example
 * // Usage in NestJS application package.json
 * "jest": "./config/jest.config.nestjs.js"
 *
 * // Run specific test suites
 * npm run test:unit        // Run unit tests only
 * npm run test:e2e         // Run e2e tests only
 * npm run test:coverage    // Run tests with coverage
 */

/** @type {import('jest').Config} */
import baseConfig from './jest.config.base.js';

export default {
  ...baseConfig,

  // NestJS specific test environment
  testEnvironment: 'node',
  testTimeout: 60000, // NestJS tests can be slower

  // TypeScript configuration for NestJS
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: true,
        astTransformers: ['jest-preset-angular/ts-jest'],
      },
    ],
  },

  // NestJS test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],

  // NestJS module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // NestJS specific setup
  setupFilesAfterEnv: ['<rootDir>/test/nestjs-setup.ts'],

  // Mock decorators and advanced features
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },

  // Coverage adjustments for NestJS
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/__mocks__/**',
    '!src/main.ts', // Entry point
    '!src/**/*.module.ts', // Often just module definitions
  ],

  // E2E test configuration
  projects: [
    // Unit tests
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      testPathIgnorePatterns: ['/e2e/'],
    },
    // E2E tests
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/test/e2e-setup.ts'],
      testTimeout: 120000,
    },
  ],
};
