import { createNodeConfig } from './build.config.node.js';

export const createNestjsConfig = (options = {}) => {
  return createNodeConfig({
    // NestJS specific entry points
    entry: options.entry || ['src/main.ts'],

    // NestJS uses CommonJS
    format: options.format || ['cjs'],

    // NestJS specific external dependencies
    external: [
      // NestJS core modules
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/platform-express',
      '@nestjs/platform-fastify',
      // Common NestJS packages
      'class-validator',
      'class-transformer',
      'reflect-metadata',
      // Third-party packages typically external
      'typeorm',
      'mongoose',
      'redis',
      'ioredis',
      'prisma',
      '@prisma/client',
      ...options.external,
    ],

    // TypeScript configuration for NestJS
    tsconfig: options.tsconfig || '../../config/tsconfig.nestjs.json',

    // NestJS doesn't typically minify server code
    minify: options.minify || false,

    // NestJS-specific banner
    banner: options.banner || {
      js: `/**
 * NestJS Application
 * @author Arif Widianto <https://github.com/sikancil>
 * @license MIT
 */`,
    },

    // Preserve decorators metadata
    esbuildOptions: (options, _esbuild) => {
      // Ensure decorators are preserved
      options.supported = {
        ...options.supported,
        decorators: true,
        'decorator-metadata': true,
      };
      return options;
    },

    ...options,
  });
};

export default createNestjsConfig;
