import { defineConfig } from 'tsup';

export const createBaseConfig = (options = {}) => {
  return defineConfig({
    // Entry point
    entry: options.entry || ['src/index.ts'],

    // Output configuration
    outDir: options.outDir || 'dist',

    // Format configuration
    format: options.format || ['cjs', 'esm'],

    // Target configuration
    target: options.target || 'node18',

    // Minification
    minify: options.minify || false,

    // Source maps
    sourcemap: options.sourcemap || true,

    // Clean output directory before build
    clean: options.clean !== false,

    // Watch mode
    watch: options.watch || false,

    // Splitting (for larger packages)
    splitting: options.splitting || false,

    // Bundle dependencies
    external: options.external || [],

    // TypeScript configuration
    tsconfig: options.tsconfig || 'tsconfig.json',

    // Define global constants
    define: options.define || {},

    // Banner and footer
    banner: options.banner,
    footer: options.footer,

    // Platform specific
    platform: options.platform || 'node',

    // Additional esbuild options
    esbuildOptions: (options, esbuild) => {
      // Add any custom esbuild options here
      return options;
    },

    // onSuccess hooks
    onSuccess: options.onSuccess,
  });
};

export default createBaseConfig;
