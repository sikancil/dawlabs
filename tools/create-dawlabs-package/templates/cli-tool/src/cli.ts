#!/usr/bin/env node

import { Command } from 'commander';
import { main } from './index.js';

const program = new Command();

program.name('{{name}}').description('{{description}}').version('0.0.1');

// Add commands here
program
  .command('run')
  .description('Run the main functionality')
  .option('-v, --verbose', 'Verbose output')
  .option('-c, --config <path>', 'Config file path')
  .action(async options => {
    try {
      await main(options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('Unknown command');
  program.help();
});

// Parse command line arguments
program.parse();
