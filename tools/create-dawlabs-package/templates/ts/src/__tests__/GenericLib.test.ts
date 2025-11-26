import { {{className}}Lib, create{{className}}Lib } from '../index';

describe('{{className}}Lib', () => {
  let lib: {{className}}Lib;

  beforeEach(() => {
    lib = new {{className}}Lib();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(lib).toBeInstanceOf({{className}}Lib);
      expect(lib.getConfig()).toEqual({});
    });

    it('should create instance with custom config', () => {
      const config = { custom: 'value' };
      const customLib = new {{className}}Lib(config);
      expect(customLib).toBeInstanceOf({{className}}Lib);
      expect(customLib.getConfig()).toEqual(config);
    });
  });

  describe('execute', () => {
    it('should return input unchanged', async () => {
      const input = 'test input';
      const result = await lib.execute(input);
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
        const result = await lib.execute(input);
        expect(result).toBe(input);
      }
    });
  });

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      (lib as any).config = { test: 'value' };
      const config = lib.getConfig();
      expect(config).toEqual({ test: 'value' });

      // Ensure it's a copy, not reference
      (config as any).modified = true;
      expect(lib.getConfig()).toEqual({ test: 'value' });
    });
  });

  describe('updateConfig', () => {
    it('should merge new config', () => {
      (lib as any).config = { existing: 'value' };
      lib.updateConfig({ new: 'config', existing: 'updated' });

      expect(lib.getConfig()).toEqual({
        existing: 'updated',
        new: 'config',
      });
    });

    it('should handle empty new config', () => {
      (lib as any).config = { test: 'value' };
      lib.updateConfig({});
      expect(lib.getConfig()).toEqual({ test: 'value' });
    });
  });

  describe('resetConfig', () => {
    it('should reset config to empty object', () => {
      (lib as any).config = { test: 'value', another: 'config' };
      lib.resetConfig();
      expect(lib.getConfig()).toEqual({});
    });

    it('should handle already empty config', () => {
      lib.resetConfig();
      expect(lib.getConfig()).toEqual({});
    });
  });
});

describe('create{{className}}Lib', () => {
  it('should create new instance', () => {
    const lib = create{{className}}Lib();
    expect(lib).toBeInstanceOf({{className}}Lib);
  });

  it('should create instance with config', () => {
    const config = { initialized: true };
    const lib = create{{className}}Lib(config);
    expect(lib.getConfig()).toEqual(config);
  });
});