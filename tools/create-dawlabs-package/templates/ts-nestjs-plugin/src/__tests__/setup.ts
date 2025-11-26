/**
 * Test setup for NestJS plugin
 */

// Mock dependencies that might not be available in test environment
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

// Mock global Reflect metadata if not available
if (!Reflect.getMetadata) {
  Reflect.getMetadata = jest.fn();
}

if (!Reflect.defineMetadata) {
  Reflect.defineMetadata = jest.fn();
}
