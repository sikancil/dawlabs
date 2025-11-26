/**
 * Main functionality of {{packageName}}
 */

export interface Options {
  verbose?: boolean;
  config?: string;
}

export async function main(options: Options = {}): Promise<void> {
  if (options.verbose) {
    console.log('{{name}} - {{description}}');
    console.log('Options:', options);
  }

  // TODO: Implement your CLI functionality here
  console.log('Hello from {{packageName}}!');

  if (options.config) {
    console.log(`Using config: ${options.config}`);
  }
}

export default main;
