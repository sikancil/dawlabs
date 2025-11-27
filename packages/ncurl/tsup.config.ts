import { createCliConfig } from '../../config/build.config.cli';

export default createCliConfig({
  entry: ['src/cli.js', 'src/index.js'],
  clean: true,
  sourcemap: true,
  shebang: '#!/usr/bin/env node', // Override shebang to prevent duplicates
  banner: {
    // Provide valid banner object instead of false
    js: `/**
 * @author Arif Widianto <https://github.com/sikancil>
 * @license MIT
 */`,
  },
  onSuccess: 'chmod +x dist/cli.cjs',
});
