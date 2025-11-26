import { createBaseConfig } from './build.config.base.js';

export const createBrowserConfig = (options = {}) => {
  return createBaseConfig({
    // Browser specific configuration
    target: options.target || 'es2020',
    platform: 'browser',

    // Default formats for browser packages
    format: options.format || ['esm', 'iife'],

    // External dependencies (don't bundle)
    external: [
      // React ecosystem
      'react',
      'react-dom',
      // Vue ecosystem
      'vue',
      // Angular ecosystem
      '@angular/core',
      // Common large dependencies
      'lodash-es',
      'moment',
      'dayjs',
      ...options.external,
    ],

    // TypeScript configuration for browser
    tsconfig: options.tsconfig || '../../config/tsconfig.browser.json',

    // Minification for browser
    minify: options.minify !== false,

    // Global definitions for browser
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...options.define,
    },

    // Enable splitting for better caching
    splitting: options.splitting !== false,

    ...options,
  });
};

export default createBrowserConfig;
