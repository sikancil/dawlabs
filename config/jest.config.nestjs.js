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
