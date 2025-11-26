import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'iife', 'cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
  external: [],
  globalName: '{{className}}',
  platform: 'browser',
});
