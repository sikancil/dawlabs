import { createCliConfig } from '../../config/build.config.cli';

export default createCliConfig({
  entry: ['src/cli.js', 'src/index.js'],
  clean: true,
  sourcemap: true,
  onSuccess: 'chmod +x dist/cli.cjs',
});
