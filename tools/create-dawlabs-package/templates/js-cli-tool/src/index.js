/**
 * Main functionality of {{packageName}}
 */

/**
 * @typedef {Object} Options
 * @property {boolean} [verbose=false] - Enable verbose output
 * @property {string} [config] - Path to configuration file
 */

export async function main(options = {}) {
  if (options.verbose) {
    console.log('{{className}} - {{description}}');
    console.log('Options:', options);
  }

  // TODO: Implement your CLI functionality here
  console.log('Hello from {{packageName}}!');

  if (options.config) {
    console.log(`Using config: ${options.config}`);
  }
}

export default main;
