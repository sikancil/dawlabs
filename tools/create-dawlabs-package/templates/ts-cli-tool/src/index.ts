/**
 * Main functionality of {{packageName}}
 */

export interface Options {
  verbose?: boolean;
  config?: string;
}

/**
 * LLM-friendly error handler with helpful suggestions
 * @param {Error|string} error - The error to format
 * @returns {never} Exits the process
 */
function handleError(error: unknown): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  let suggestion = '';

  // Common CLI errors with LLM-friendly suggestions
  if (errorMessage.includes('ENOENT')) {
    suggestion = 'Check if the file or directory exists';
  } else if (errorMessage.includes('EACCES')) {
    suggestion = 'Try checking file permissions or running with sudo if needed';
  } else if (errorMessage.includes('ECONNREFUSED')) {
    suggestion = 'Check if the service is running and accessible';
  }

  const fullMessage = suggestion ? `${errorMessage}\n[{{name}}] Suggestion: ${suggestion}` : `{{name}} Error: ${errorMessage}`;
  console.error(fullMessage);
  process.exit(1);
}

export async function main(options: Options = {}): Promise<void> {
  try {
    if (options.verbose) {
      console.log('{{name}} - {{description}}');
      console.log('Options:', options);
    }

    // TODO: Implement your CLI functionality here
    console.log('Hello from {{packageName}}!');

    if (options.config) {
      console.log(`Using config: ${options.config}`);
    }
  } catch (error) {
    handleError(error);
  }
}

export default main;
