import { AppService } from '../src/app.service.js';

describe('AppService', () => {
  let appService;

  beforeEach(() => {
    appService = new AppService();
  });

  describe('getHello', () => {
    it('should return welcome message', () => {
      const result = appService.getHello();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
      expect(result.message).toBe('Welcome to TestJsNestjsApp API!');
    });
  });

  describe('processData', () => {
    it('should process data correctly', () => {
      const testData = { name: 'test', description: 'test description' };
      const result = appService.processData(testData);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('processedAt');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appService.getHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.status).toBe('healthy');
    });
  });
});
