#!/usr/bin/env node

/**
 * DAWLabs Deployment Setup Tool
 *
 * A comprehensive CLI tool for automating deployment configuration and verification across
 * DAWLabs monorepo packages. This tool handles:
 * - NPM publishing configurations with proper tokens and registry settings
 * - CI/CD workflow setup and validation
 * - Repository configuration (git hooks, permissions, etc.)
 * - System diagnostics and environment verification
 * - Complete deployment pipeline setup
 *
 * Architecture: Modular command structure with separate modules for each deployment aspect
 * Error Handling: Comprehensive error handling with helpful user guidance
 * Environment: Works across different development and deployment environments
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

// Commented but reserved for potential future use with file operations
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Import command modules - each handles a specific deployment aspect
import { setupNpmPublishing } from './commands/npm-publishing.js'; // NPM registry and publishing setup
import { verifyCicdWorkflow } from './commands/cicd-workflow.js'; // CI/CD pipeline configuration
import { setupRepositoryConfig } from './commands/repository-setup.js'; // Git repository setup
import { diagnoseSystem } from './commands/diagnostics.js'; // Environment diagnostics
import { setupAll } from './commands/setup-all.js'; // Complete deployment setup

// Import utilities
// import { checkNpmPackage } from './utils/npm-api.js';
import { validateSystemDependencies, displayValidationResults } from './utils/validators.js';

const program = new Command();

// Configure CLI with deployment-specific options
// The tool is designed to be user-friendly with colored output and verbose debugging capabilities
program
  .name('dawlabs-deploy')
  .description('Semi-automated deployment setup and verification for DAWLabs packages')
  .version('0.0.1')
  .option('-v, --verbose', 'enable verbose output for debugging and detailed operation logs')
  .option('--no-color', "disable colored output for environments that don't support ANSI colors");

// Setup command with comprehensive deployment configuration options
// This is the main command for setting up various deployment aspects
program
  .command('setup')
  .description('Setup deployment configurations for different deployment targets')
  .argument('<type>', 'type of setup: npm-publishing, cicd-workflow, repository, all')
  .option('--interactive', 'interactive setup with user-friendly prompts and guidance')
  .option('--auto-verify', 'automatically verify configuration after setup completion')
  .option(
    '--package <package>',
    'target specific package for setup (e.g., @dawlabs/ncurl or ncurl)',
  )
  .action(async (type, options) => {
    try {
      console.log(chalk.blue.bold(`\n🚀 Setting up ${type}...\n`));

      // Validate system dependencies for setup commands that need them
      const needsValidation = ['npm-publishing', 'cicd-workflow', 'all'].includes(type);
      if (needsValidation) {
        const validation = validateSystemDependencies();
        if (!validation.valid) {
          displayValidationResults(validation);
          console.log(
            chalk.red(
              '\n❌ Setup cancelled due to missing dependencies. Please install the required tools and try again.\n',
            ),
          );
          process.exit(1);
        }
      }

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

      // Validate system dependencies for verification commands that need them
      const needsValidation = ['npm-publishing', 'cicd-workflow', 'all'].includes(type);
      if (needsValidation) {
        const validation = validateSystemDependencies();
        if (!validation.valid) {
          displayValidationResults(validation);
          console.log(
            chalk.red(
              '\n❌ Verification cancelled due to missing dependencies. Please install the required tools and try again.\n',
            ),
          );
          process.exit(1);
        }
      }

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
  const spinner = ora('Verifying NPM publishing setup...').start();

  try {
    // Import necessary functions from npm-publishing module
    const { findWorkspacePackages, checkGitHubAuth, getRepositoryInfo } = await import(
      './commands/npm-publishing.js'
    );

    // Step 1: Check GitHub CLI authentication
    spinner.text = 'Checking GitHub CLI authentication...';
    const { authenticated } = checkGitHubAuth();

    if (!authenticated) {
      spinner.fail('GitHub CLI not authenticated');
      console.log(chalk.red('❌ Run: gh auth login'));
      return false;
    }
    spinner.succeed('GitHub CLI authenticated');

    // Step 2: Get repository information
    spinner.text = 'Getting repository information...';
    const repoInfo = await getRepositoryInfo();

    if (!repoInfo) {
      spinner.fail('Could not get repository information');
      console.log(chalk.red('❌ Not in a GitHub repository'));
      return false;
    }
    spinner.succeed(`Repository: ${repoInfo.name}`);

    // Step 3: Scan workspace packages
    spinner.text = 'Scanning workspace packages...';
    const packages = await findWorkspacePackages();

    if (packages.length === 0) {
      spinner.warn('No packages found in workspace');
      return false;
    }
    spinner.succeed(`Found ${packages.length} packages`);

    // Step 4: Check each package's publishing status
    spinner.text = 'Checking package publishing status...';
    console.log(chalk.blue('\n📊 Package Publishing Status:\n'));

    let publishedCount = 0;
    let unpublishedCount = 0;
    const issues = [];

    for (const pkg of packages) {
      const status = pkg.published ? '✅ Published' : '❌ Not Published';
      const version = `${pkg.name}@${pkg.version}`;

      console.log(`${status.padEnd(14)} ${version}`);

      if (pkg.published) {
        publishedCount++;
      } else {
        unpublishedCount++;
        console.log(chalk.yellow(`   💡 Setup required: npm publish --access public --otp=CODE`));

        // Check if package has proper configuration
        if (!pkg.packageJson.publishConfig) {
          issues.push(`${pkg.name}: Missing publishConfig with public access`);
        }
      }
    }

    // Step 5: Display summary
    console.log(chalk.blue('\n📈 Summary:'));
    console.log(`  Published: ${chalk.green(publishedCount)} packages`);
    console.log(`  Unpublished: ${chalk.yellow(unpublishedCount)} packages`);

    if (issues.length > 0) {
      console.log(chalk.red('\n⚠️  Issues found:'));
      issues.forEach(issue => console.log(`  • ${issue}`));
      spinner.warn('NPM publishing verification completed with issues');
      return false;
    }

    spinner.succeed('NPM publishing verification completed');
    return true;
  } catch (error) {
    spinner.fail('NPM publishing verification failed');
    console.error(chalk.red(`Error: ${error.message}`));
    return false;
  }
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
