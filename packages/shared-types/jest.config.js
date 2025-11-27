/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  passWithNoTests: true,
};
