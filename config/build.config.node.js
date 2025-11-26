import { createBaseConfig } from './build.config.base.js';

export const createNodeConfig = (options = {}) => {
  return createBaseConfig({
    // Node.js specific configuration
    target: 'node18',
    platform: 'node',

    // Default formats for Node.js packages
    format: options.format || ['cjs', 'esm'],

    // Common external dependencies for Node.js packages
    external: [
      // Node.js built-ins
      'fs',
      'path',
      'url',
      'os',
      'util',
      'events',
      // Common dependencies
      'lodash',
      'axios',
      'commander',
      ...options.external,
    ],

    // TypeScript configuration for Node.js
    tsconfig: options.tsconfig || '../../config/tsconfig.node.json',

    // Minification for production
    minify: options.minify || process.env.NODE_ENV === 'production',

    ...options,
  });
};

export default createNodeConfig;
