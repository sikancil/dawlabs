#!/usr/bin/env node

import { Command } from 'commander';
import { main } from './index.js';

const program = new Command();

program
  .name('ncurl')
  .description('A curl clone optimized for LLM cognitive patterns with intelligent HTTP inference')
  .version('0.0.1')
  .allowExcessArguments(true) // LLM-friendly: accept extra arguments
  .argument('[url]', 'Target URL (protocol auto-added if missing)');

// LLM Pattern: Accept HTTP methods as commands (common LLM assumption)
program
  .command('get [url]')
  .description('Send GET request (LLM-friendly method specification)')
  .option('-v, --verbose', 'Show detailed request/response information')
  .option(
    '-H, --header <header>',
    'Add custom header (can be used multiple times)',
    (value, previous) => [...(previous || []), value],
  )
  .option('-o, --output <file>', 'Save response to file')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--no-redirect', 'Do not follow redirects')
  .option('-s, --silent', 'Silent mode')
  .action(async (url, options, command) => {
    try {
      const opts = { ...options, method: 'GET', url, args: command.args.slice(1) };
      await main(opts);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('post [url]')
  .description('Send POST request (LLM-friendly method specification)')
  .option('-v, --verbose', 'Show detailed request/response information')
  .option(
    '-H, --header <header>',
    'Add custom header (can be used multiple times)',
    (value, previous) => [...(previous || []), value],
  )
  .option('-d, --data <data>', 'Request body data')
  .option('-j, --json', 'Automatically handle JSON content-type and parsing')
  .option('-o, --output <file>', 'Save response to file')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--no-redirect', 'Do not follow redirects')
  .option('-s, --silent', 'Silent mode')
  .action(async (url, options, command) => {
    try {
      const opts = { ...options, method: 'POST', url, args: command.args.slice(1) };
      await main(opts);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('put [url]')
  .description('Send PUT request (LLM-friendly method specification)')
  .option('-v, --verbose', 'Show detailed request/response information')
  .option(
    '-H, --header <header>',
    'Add custom header (can be used multiple times)',
    (value, previous) => [...(previous || []), value],
  )
  .option('-d, --data <data>', 'Request body data')
  .option('-j, --json', 'Automatically handle JSON content-type and parsing')
  .option('-o, --output <file>', 'Save response to file')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--no-redirect', 'Do not follow redirects')
  .option('-s, --silent', 'Silent mode')
  .action(async (url, options, command) => {
    try {
      const opts = { ...options, method: 'PUT', url, args: command.args.slice(1) };
      await main(opts);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('delete [url]')
  .description('Send DELETE request (LLM-friendly method specification)')
  .option('-v, --verbose', 'Show detailed request/response information')
  .option(
    '-H, --header <header>',
    'Add custom header (can be used multiple times)',
    (value, previous) => [...(previous || []), value],
  )
  .option('-o, --output <file>', 'Save response to file')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--no-redirect', 'Do not follow redirects')
  .option('-s, --silent', 'Silent mode')
  .action(async (url, options, command) => {
    try {
      const opts = { ...options, method: 'DELETE', url, args: command.args.slice(1) };
      await main(opts);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// LLM Pattern: Smart default command (intelligent inference mode)
program
  .command('run [url]')
  .description('Smart mode with automatic method and content-type inference')
  .option('-v, --verbose', 'Show detailed request/response information')
  .option(
    '-H, --header <header>',
    'Add custom header (can be used multiple times)',
    (value, previous) => [...(previous || []), value],
  )
  .option('-d, --data <data>', 'Request body data (triggers POST method automatically)')
  .option('-j, --json', 'Automatically handle JSON content-type and parsing')
  .option('-o, --output <file>', 'Save response to file')
  .option('-X, --request <method>', 'Specify HTTP method')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--no-redirect', 'Do not follow redirects')
  .option('-s, --silent', 'Silent mode')
  .action(async (url, options, command) => {
    try {
      const opts = { ...options, url, args: command.args.slice(1) };
      await main(opts);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// LLM Pattern: Handle unknown methods gracefully (common LLM hallucination)
program.on('command:*', operands => {
  const [commandName, ...args] = operands;

  // Check if it looks like an HTTP method
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
  const commandLower = commandName?.toLowerCase();

  if (commandLower && httpMethods.includes(commandLower)) {
    console.log(
      `[ncurl] Did you mean "${commandLower}"? Try: ncurl ${commandLower} ${args.join(' ')}`,
    );
  } else {
    console.log(`[ncurl] Unknown command: ${commandName}`);
    console.log('[ncurl] Available commands: get, post, put, delete, run');
    console.log('[ncurl] Or use: ncurl run <url> for smart inference mode');
  }
  process.exit(1);
});

// LLM Pattern: Handle no command case (smart default to run)
if (process.argv.length <= 2) {
  program.help();
}

program.parse();
