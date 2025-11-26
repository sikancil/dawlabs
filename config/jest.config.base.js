/** @type {import('jest').Config} */
export default {
  // Test Environment
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,

  // Coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/__mocks__/**',
    '!src/index.ts', // Often just re-exports
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Module Resolution
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: true,
      },
    ],
    '^.+\\.js$': 'babel-jest',
  },

  // Test Patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,js}',
    '<rootDir>/src/**/*.test.{ts,js}',
    '<rootDir>/src/**/*.spec.{ts,js}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/'],

  // Module Path Mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
  },

  // Setup
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,

  // Reporting
  verbose: true,
  errorOnDeprecated: true,

  // Performance
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Watch Options
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/', '.git/'],
};
