import { {{className}}Service, create{{className}}Service } from '../index';

describe('{{className}}Service', () => {
  let service;

  beforeEach(() => {
    service = new {{className}}Service();
  });

  describe('constructor', () => {
    it('should create service with default config', () => {
      expect(service).toBeInstanceOf({{className}}Service);
    });

    it('should create service with custom config', () => {
      const config = { custom: 'value' };
      const customService = new {{className}}Service(config);
      expect(customService).toBeInstanceOf({{className}}Service);
    });
  });

  describe('execute', () => {
    it('should return the input unchanged', async () => {
      const input = 'test input';
      const result = await service.execute(input);
      expect(result).toBe(input);
    });

    it('should handle various input types', async () => {
      const inputs = [
        'string',
        123,
        { key: 'value' },
        [1, 2, 3],
        null,
        undefined,
      ];

      for (const input of inputs) {
        const result = await service.execute(input);
        expect(result).toBe(input);
      }
    });
  });
});

describe('create{{className}}Service', () => {
  it('should create a new service instance', () => {
    const service = create{{className}}Service();
    expect(service).toBeInstanceOf({{className}}Service);
  });

  it('should create service with config', () => {
    const config = { test: true };
    const service = create{{className}}Service(config);
    expect(service).toBeInstanceOf({{className}}Service);
  });
});