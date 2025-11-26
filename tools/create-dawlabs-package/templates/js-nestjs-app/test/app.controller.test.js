import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';

describe('AppController', () => {
  let appController;
  let appService;

  beforeEach(() => {
    appService = new AppService();
    appController = new AppController(appService);
  });

  describe('getHello', () => {
    it('should return welcome message', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
    });
  });

  describe('processData', () => {
    it('should process data correctly', async () => {
      const testData = { name: 'test', description: 'test description' };
      jest.spyOn(appService, 'processData').mockResolvedValueOnce({
        success: true,
        data: testData,
        processedAt: new Date(),
        message: 'Data processed successfully',
      });

      const result = await appController.processData();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('processedAt');
      expect(result).toHaveProperty('message');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.status).toBe('healthy');
    });
  });

  describe('getVersion', () => {
    it('should return version information', () => {
      const result = appController.getVersion();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result.name).toBe('@dawlabs/test-js-nestjs-app');
      expect(result.version).toBe('0.0.1');
    });
  });
});
