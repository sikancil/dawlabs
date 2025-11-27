import { describe, it, expect } from '@jest/globals';
import { main } from '../src/index.js';

describe('Ncurl', () => {
  it('should run without options', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await main();

    expect(consoleSpy).toHaveBeenCalledWith('Hello from @dawlabs/ncurl!');

    consoleSpy.mockRestore();
  });

  it('should run with verbose option', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await main({ verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith('Ncurl - A curl clone optimized for LLM cognitive patterns with intelligent HTTP inference');
    expect(consoleSpy).toHaveBeenCalledWith('Hello from @dawlabs/ncurl!');

    consoleSpy.mockRestore();
  });

  it('should handle config option', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await main({ config: 'test.json' });

    expect(consoleSpy).toHaveBeenCalledWith('Using config: test.json');

    consoleSpy.mockRestore();
  });
});