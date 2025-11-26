import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs', 'iife'],
  clean: true,
  sourcemap: true,
  globalName: '{{className}}',
  banner: {
    js: '/**\n * {{description}}\n * @version 1.0.0\n */',
  },
});
