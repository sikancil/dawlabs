import { defineConfig } from 'tsup';

export function createCliConfig(options = {}) {
  return defineConfig({
    entry: ['src/index.js'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
    ...options,
  });
}
