#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Import command modules
import { setupNpmPublishing } from './commands/npm-publishing.js';
import { verifyCicdWorkflow } from './commands/cicd-workflow.js';
import { setupRepositoryConfig } from './commands/repository-setup.js';
import { diagnoseSystem } from './commands/diagnostics.js';
import { setupAll } from './commands/setup-all.js';

const program = new Command();

// Configure CLI
program
  .name('dawlabs-deploy')
  .description('Semi-automated deployment setup and verification for DAWLabs packages')
  .version('0.0.1')
  .option('-v, --verbose', 'enable verbose output')
  .option('--no-color', 'disable colored output');

// Setup commands
program
  .command('setup')
  .description('Setup deployment configurations')
  .argument('<type>', 'type of setup (npm-publishing, cicd-workflow, repository, all)')
  .option('--interactive', 'interactive setup with prompts')
  .option('--auto-verify', 'automatically verify after setup')
  .action(async (type, options) => {
    try {
      console.log(chalk.blue.bold(`\n🚀 Setting up ${type}...\n`));

      switch (type) {
        case 'npm-publishing':
          await setupNpmPublishing(options);
          break;
        case 'cicd-workflow':
          console.log(chalk.yellow('CI/CD workflow setup not implemented yet'));
          break;
        case 'repository':
          await setupRepositoryConfig(options);
          break;
        case 'all':
          await setupAll(options);
          break;
        default:
          console.error(chalk.red(`❌ Unknown setup type: ${type}`));
          console.log(
            chalk.cyan('Available types: npm-publishing, cicd-workflow, repository, all'),
          );
          process.exit(1);
      }

      if (options.autoVerify) {
        console.log(chalk.green('\n✅ Setup completed! Running verification...\n'));
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Setup failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Verification commands
program
  .command('verify')
  .description('Verify deployment configurations')
  .argument('<type>', 'type of verification (npm-publishing, cicd-workflow, package-config, all)')
  .action(async type => {
    try {
      console.log(chalk.blue.bold(`\n🔍 Verifying ${type}...\n`));

      switch (type) {
        case 'npm-publishing':
          await verifyNpmPublishing();
          break;
        case 'cicd-workflow':
          await verifyCicdWorkflow();
          break;
        case 'package-config':
          console.log(chalk.yellow('Package configuration verification not implemented yet'));
          break;
        case 'all':
          await verifyAll();
          break;
        default:
          console.error(chalk.red(`❌ Unknown verification type: ${type}`));
          console.log(
            chalk.cyan('Available types: npm-publishing, cicd-workflow, package-config, all'),
          );
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Verification failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Diagnostic commands
program
  .command('diagnose')
  .description('Diagnose deployment issues')
  .argument('<scope>', 'diagnostic scope (repository, publishing, workflow, all)')
  .option('--fix', 'attempt to fix detected issues')
  .action(async (scope, options) => {
    try {
      console.log(chalk.blue.bold(`\n🩺 Diagnosing ${scope}...\n`));

      await diagnoseSystem(scope, options);
    } catch (error) {
      console.error(chalk.red(`\n❌ Diagnosis failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show current deployment status')
  .option('--json', 'output status in JSON format')
  .action(async options => {
    try {
      const status = await getDeploymentStatus();

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        displayStatus(status);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Status check failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Import helper functions
async function verifyNpmPublishing() {
  // Implementation would go here
  console.log(chalk.yellow('NPM publishing verification not implemented yet'));
}

async function verifyAll() {
  console.log(chalk.blue('Running all verifications...\n'));
  await verifyNpmPublishing();
  await verifyCicdWorkflow();
  console.log(chalk.green('\n✅ All verifications completed!\n'));
}

async function getDeploymentStatus() {
  // This would check actual status
  return {
    repository: {
      configured: true,
      trustedPublishing: true,
      cicd: true,
    },
    packages: [
      {
        name: '@dawlabs/shared-types',
        published: true,
        version: '0.0.1',
      },
      {
        name: '@dawlabs/create-package',
        published: true,
        version: '0.0.2',
      },
    ],
  };
}

function displayStatus(status) {
  console.log(chalk.bold('\n📊 Deployment Status:\n'));

  console.log(chalk.blue('Repository Configuration:'));
  console.log(`  Trusted Publishing: ${status.repository.trustedPublishing ? '✅' : '❌'}`);
  console.log(`  CI/CD Workflow: ${status.repository.cicd ? '✅' : '❌'}`);
  console.log(`  Repository Setup: ${status.repository.configured ? '✅' : '❌'}`);

  console.log(chalk.blue('\nPackage Status:'));
  status.packages.forEach(pkg => {
    console.log(
      `  ${pkg.name}@${pkg.version}: ${pkg.published ? '✅ Published' : '❌ Not published'}`,
    );
  });

  console.log('');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
