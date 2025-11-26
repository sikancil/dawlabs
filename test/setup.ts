import 'jest';

// Global test setup
beforeAll(() => {
  // Set timezone for consistent date testing
  process.env.TZ = 'UTC';
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  jest.useFakeTimers().setSystemTime(mockDate);
};

export const resetDate = () => {
  jest.useRealTimers();
};

// Global cleanup
afterAll(() => {
  resetDate();
});