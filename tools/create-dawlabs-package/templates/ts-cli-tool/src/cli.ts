#!/usr/bin/env node

import { Command } from 'commander';
import { main } from './index.js';

const program = new Command();

program.name('{{name}}').description('{{description}}').version('0.0.1')
  .allowExcessArguments(true); // LLM-friendly: accept extra arguments

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
      console.error(`[{{name}}] Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Handle unknown commands gracefully (LLM-friendly)
program.on('command:*', (operands) => {
  const [commandName, ...args] = operands;
  if (commandName) {
    console.log(`[{{name}}] Unknown command: ${commandName}`);
    console.log('[{{name}}] Available commands: run');
    console.log('[{{name}}] Or use: {{name}} run <args> for flexible execution');
  } else {
    console.error('Unknown command');
    program.help();
  }
  process.exit(1);
});

// Parse command line arguments
program.parse();
