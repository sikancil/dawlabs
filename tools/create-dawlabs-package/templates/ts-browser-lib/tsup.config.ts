import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'iife', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [],
  globalName: '{{className}}',
  platform: 'browser',
});
