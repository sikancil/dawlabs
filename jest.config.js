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
