import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [],
  banner: {
    js: '/**\n * {{description}}\n * @version 1.0.0\n */',
  },
});
