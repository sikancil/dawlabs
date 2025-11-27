/**
 * DAWLabs CLI Build Configuration
 *
 * Creates optimized build configurations for CLI tools with proper executable handling,
 * bundling, and distribution settings. This configuration ensures CLI tools are:
 * - Portable and executable across different environments
 * - Properly bundled to avoid dependency issues
 * - Optimized for distribution with appropriate licensing
 *
 * @param {Object} options - Build configuration options
 * @returns {Object} Complete CLI build configuration
 */

import { createNodeConfig } from './build.config.node.js';

export const createCliConfig = (options = {}) => {
  return createNodeConfig({
    // Entry point for CLI applications (commonly src/cli.ts)
    // CLI tools typically have a single entry point that handles argument parsing
    entry: options.entry || ['src/cli.ts'],

    // Output format: CommonJS for Node.js CLI compatibility
    // Reason: CJS ensures broader Node.js version compatibility and easier debugging
    format: options.format || ['cjs'],

    // Executable shebang for direct CLI execution
    // Ensures the generated binary can be run directly: ./cli.js
    shebang: options.shebang !== false ? '#!/usr/bin/env node' : undefined,

    // Bundle dependencies for self-contained CLI distribution
    // CLI tools should work without requiring separate npm install
    // Note: Empty array means bundle all dependencies by default
    external: options.external || [],

    // Use CLI-specific TypeScript configuration
    // Excludes build artifacts and focuses on source code compilation
    tsconfig: options.tsconfig || '../../config/tsconfig.cli.json',

    // Minify for distribution (smaller bundle size)
    // Balances readability with distribution efficiency
    minify: options.minify !== false,

    // Banner with licensing information (no shebang - handled separately)
    // Important: Shebang is handled by the shebang option to prevent duplicates
    banner: options.banner || {
      js: `/**
 * @author Arif Widianto <https://github.com/sikancil>
 * @license MIT
 */`,
    },

    // Post-build hook to make CLI executable
    // Ensures proper file permissions for direct execution
    onSuccess: options.onSuccess || 'chmod +x dist/cli.js',

    // Bundle all dependencies for self-contained CLI distribution
    // CLI tools should be distributable without external dependencies
    bundle: options.bundle !== false,

    // Merge any additional options
    ...options,
  });
};

// Export as default for consistent import patterns
export default createCliConfig;
