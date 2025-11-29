/**
 * DAWLabs NestJS Build Configuration - Production-Ready NestJS Application Builder
 *
 * @context Specialized build configuration for NestJS applications within the DAWLabs monorepo
 * @purpose Provides optimized build configuration for NestJS applications with framework-specific settings, external dependencies, and decorator support
 * @integration Used by NestJS applications and plugins for production builds, deployment packaging, and distribution preparation
 * @workflow Extends base Node.js build configuration with NestJS-specific optimizations, TypeScript settings, and build customizations
 *
 * NestJS Build Strategy:
 * - Framework Support: Optimized for NestJS decorators, dependency injection, and metadata reflection
 * - External Dependencies: Excludes common NestJS packages and database libraries from bundling
 * - TypeScript Integration: Dedicated TypeScript configuration for NestJS project structure
 * - Production Ready: Configured for server deployment with appropriate CommonJS output
 *
 * Configuration Features:
 * - Entry Points: Standard NestJS main.ts entry with customization support
 * - Format Target: CommonJS output for Node.js compatibility and server deployment
 * - External Packages: Comprehensive external dependency list for optimal bundle size
 * - Decorator Support: ESBuild configuration preserving decorators and metadata
 *
 * External Dependencies:
 * - NestJS Core: Core framework modules excluded from bundling
 * - Validation Libraries: class-validator and class-transformer typically external
 * - Database Libraries: TypeORM, Mongoose, Prisma, and Redis clients
 * - Platform Libraries: Express and Fastify platform adapters
 *
 * Build Optimizations:
 * - No Minification: Preserves readability for server-side debugging
 * - Decorator Preservation: Maintains NestJS decorator functionality
 * - Metadata Support: Ensures reflection metadata is properly handled
 * - Banner Generation: Adds application attribution and license information
 *
 * Integration Points:
 * - Turborepo: Integrated with monorepo build orchestration and caching
 * - Templates: Used by create-dawlabs-package for NestJS application templates
 * - CI/CD: Configured for automated deployment and packaging workflows
 * - Development: Supports both development and production build modes
 *
 * @example
 * // Usage in NestJS application tsup.config.js
 * import { createNestjsConfig } from './config/build.config.nestjs.js';
 * export default createNestjsConfig({
 *   entry: ['src/main.ts'],
 *   external: ['@nestjs/microservices']
 * });
 *
 * // Direct usage for custom builds
 * const config = createNestjsConfig({
 *   minify: true,
 *   sourcemap: true
 * });
 */

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
