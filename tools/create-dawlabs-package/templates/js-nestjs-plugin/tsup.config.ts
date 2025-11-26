import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
  external: ['@nestjs/common', '@nestjs/core', '@nestjs/testing', 'reflect-metadata', 'rxjs'],
});
