// E2E Test Setup
import 'jest';

beforeAll(async () => {
  // Set up test environment for E2E tests
  process.env.NODE_ENV = 'test';

  // Increase timeout for E2E tests
  jest.setTimeout(60000);
});

afterAll(async () => {
  // Cleanup E2E test environment
  jest.setTimeout(5000);
});

// E2E specific utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retry = async (fn: () => Promise<void>, times = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < times; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error;
      if (i < times - 1) {
        await waitFor(delay);
      }
    }
  }

  throw lastError;
};