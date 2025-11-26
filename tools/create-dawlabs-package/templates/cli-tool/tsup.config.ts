import { createCliConfig } from '../../../config/build.config.cli.js';

export default createCliConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  clean: true,
  sourcemap: true,
  onSuccess: 'chmod +x dist/cli.js',
});
