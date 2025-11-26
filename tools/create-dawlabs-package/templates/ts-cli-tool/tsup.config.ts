import { createCliConfig } from '../../config/build.config.cli';

export default createCliConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  clean: true,
  sourcemap: true,
  onSuccess: 'chmod +x dist/cli.cjs',
});
