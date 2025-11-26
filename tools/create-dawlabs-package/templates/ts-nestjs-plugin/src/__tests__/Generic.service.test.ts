import { Test, TestingModule } from '@nestjs/testing';
import { {{className}}Service } from '../{{className}}.service';
import { {{className}}Config } from '../interfaces';

describe('{{className}}Service', () => {
  let service: {{className}}Service;
  let config: {{className}}Config;

  beforeEach(async () => {
    config = {
      enableLogging: true,
      options: { test: true },
      services: { api: 'http://localhost:3000' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {{className}}Service,
        {
          provide: '{{className}}_CONFIG',
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<{{className}}Service>({{className}}Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return configuration', () => {
      const result = service.getConfig();
      expect(result).toEqual(config);
    });

    it('should return a copy of config', () => {
      const result = service.getConfig();
      result.modified = true;
      expect(service.getConfig()).not.toEqual(result);
    });
  });

  describe('processData', () => {
    it('should process data successfully', async () => {
      const testData = { message: 'test data' };
      const result = await service.processData(testData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.error).toBeUndefined();
    });

    it('should handle processing errors', async () => {
      const errorMessage = 'Processing failed';
      jest.spyOn(service as any, 'transformData').mockRejectedValueOnce(new Error(errorMessage));

      const testData = { message: 'test data' };
      const result = await service.processData(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.data).toBeUndefined();
    });

    it('should handle various data types', async () => {
      const testCases = [
        'string',
        123,
        { key: 'value' },
        [1, 2, 3],
        null,
        undefined,
      ];

      for (const testData of testCases) {
        const result = await service.processData(testData);
        expect(result.success).toBe(true);
        expect(result.data).toBe(testData);
      }
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy service', async () => {
      const result = await service.healthCheck();
      expect(result).toBe(true);
    });

    it('should handle health check errors', async () => {
      // Mock implementation to throw error
      jest.spyOn(service as any, 'healthCheck').mockImplementationOnce(async () => {
        throw new Error('Health check failed');
      });

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('emitEvent', () => {
    it('should emit event successfully', async () => {
      const eventName = 'test-event';
      const payload = { data: 'test' };

      await expect(service.emitEvent(eventName, payload)).resolves.not.toThrow();
    });
  });

  describe('private methods', () => {
    it('should transform data correctly', async () => {
      const testData = { test: 'data' };
      const result = await (service as any).transformData(testData);
      expect(result).toEqual(testData);
    });
  });
});