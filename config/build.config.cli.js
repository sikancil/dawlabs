import { createNodeConfig } from './build.config.node.js';

export const createCliConfig = (options = {}) => {
  return createNodeConfig({
    // CLI specific entry point
    entry: options.entry || ['src/cli.ts'],

    // Single file output for CLI
    format: options.format || ['cjs'],

    // CLI needs to be executable
    shebang: options.shebang !== false ? '#!/usr/bin/env node' : undefined,

    // Include all dependencies for CLI (usually no external)
    external: options.external || [],

    // TypeScript configuration for CLI
    tsconfig: options.tsconfig || '../../config/tsconfig.cli.json',

    // Minify CLI for distribution
    minify: options.minify !== false,

    // Banner for CLI
    banner: options.banner || {
      js: `#!/usr/bin/env node
/**
 * @author Arif Widiyanto <arif@dawlabs.dev>
 * @license MIT
 */`,
    },

    // CLI specific onSuccess hook
    onSuccess: options.onSuccess || 'chmod +x dist/cli.js',

    // CLI should not have dependencies that aren't bundled
    bundle: options.bundle !== false,

    ...options,
  });
};

export default createCliConfig;
