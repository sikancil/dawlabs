import { Test } from '@nestjs/testing';
import 'jest';

// NestJS specific global setup
beforeAll(async () => {
  // Mock reflect-metadata for NestJS decorators
  require('reflect-metadata');
});

// Helper function for creating test modules
export const createTestModule = async (moduleOptions) => {
  return Test.createTestingModule(moduleOptions).compile();
};

// Global NestJS test utilities
export const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

export const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

// Mock common NestJS decorators
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  // Add any specific mocks if needed
}));

// Mock common NestJS packages
jest.mock('@nestjs/platform-express', () => ({
  ...jest.requireActual('@nestjs/platform-express'),
}));