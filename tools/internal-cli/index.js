#!/usr/bin/env node

/**
 * DAWLabs Internal CLI Tool
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
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

// Import command modules - each handles a specific deployment aspect
import { setupNpmPublishing } from './commands/npm-publishing.js'; // NPM registry and publishing setup
import { verifyCicdWorkflow, setupCicdWorkflow } from './commands/cicd-workflow.js'; // CI/CD pipeline configuration
import { setupRepositoryConfig } from './commands/repository-setup.js'; // Git repository setup
import { diagnoseSystem } from './commands/diagnostics.js'; // Environment diagnostics
import { setupAll } from './commands/setup-all.js'; // Complete deployment setup
import { setupConfigCommand } from './commands/config.js'; // Configuration management
// Import utilities
import { validateSystemDependencies, displayValidationResults } from './utils/validators.js';

const program = new Command();

// Configure CLI with deployment-specific options
// The tool is designed to be user-friendly with colored output and verbose debugging capabilities
program
  .name('dawlabs-cli')
  .description(
    'Internal CLI tool for DAWLabs package management, verification, and deployment workflows',
  )
  .version('0.0.1')
  .option('-v, --verbose', 'enable verbose output for debugging and detailed operation logs')
  .option('--no-color', "disable colored output for environments that don't support ANSI colors");

// Override Commander.js default exit codes for POSIX/GNU compliance
// Exit code 2 for usage errors, exit code 1 for other errors
program.on('command:*', operands => {
  if (operands.length === 0) {
    console.error(chalk.red(`\n❌ Error: Missing command`));
    program.help();
    process.exit(2);
  }

  console.error(chalk.red(`\n❌ Unknown command: ${operands[0]}`));
  console.error(chalk.cyan('Available commands:'));
  program.commands.forEach(cmd => {
    console.error(chalk.cyan(`  ${cmd.name()}${cmd.alias() ? `, ${cmd.alias()}` : ''}`));
  });
  console.error(chalk.cyan('\nRun --help for more information'));
  process.exit(2);
});

// Setup configuration management commands
setupConfigCommand(program);

// Setup command with comprehensive deployment configuration options
// This is the main command for setting up various deployment aspects
program
  .command('setup')
  .alias('s')
  .description('Setup deployment configurations for different deployment targets')
  .argument('<type>', 'type of setup: npm-publishing, cicd-workflow, repository, all')
  .option('--no-interactive', 'disable interactive setup and run in non-interactive mode')
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

      // Set interactive mode as default (options.noInteractive = false means interactive)
      const setupOptions = {
        ...options,
        interactive: options.noInteractive !== true, // Default to interactive unless explicitly disabled
      };

      // Validate setup type before processing
      const validTypes = ['npm-publishing', 'cicd-workflow', 'repository', 'all'];
      if (!validTypes.includes(type)) {
        console.error(chalk.red(`\n❌ Unknown setup type: ${type}`));
        console.error(
          chalk.cyan('Available types: npm-publishing, cicd-workflow, repository, all'),
        );
        process.exit(2);
      }

      switch (type) {
        case 'npm-publishing':
          await setupNpmPublishing(setupOptions);
          break;
        case 'cicd-workflow':
          await setupCicdWorkflow(setupOptions);
          break;
        case 'repository':
          await setupRepositoryConfig(setupOptions);
          break;
        case 'all':
          await setupAll(setupOptions);
          break;
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
  .alias('v')
  .description('Verify deployment configurations')
  .argument('<type>', 'type of verification (npm-publishing, cicd-workflow, package-config, all)')
  .action(async type => {
    try {
      console.log(chalk.blue.bold(`\n🔍 Verifying ${type}...\n`));

      // Validate verification type
      const validTypes = ['npm-publishing', 'cicd-workflow', 'package-config', 'all'];
      if (!validTypes.includes(type)) {
        console.error(chalk.red(`\n❌ Unknown verification type: ${type}`));
        console.error(
          chalk.cyan('Available types: npm-publishing, cicd-workflow, package-config, all'),
        );
        process.exit(2);
      }

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
          await verifyPackageConfig();
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
  .alias('d')
  .description('Diagnose deployment issues')
  .argument('<scope>', 'diagnostic scope (repository, publishing, workflow, all)')
  .option('--fix', 'attempt to fix detected issues')
  .action(async (scope, options) => {
    try {
      console.log(chalk.blue.bold(`\n🩺 Diagnosing ${scope}...\n`));

      // Validate diagnostic scope
      const validScopes = ['repository', 'publishing', 'workflow', 'all'];
      if (!validScopes.includes(scope)) {
        console.error(chalk.red(`\n❌ Unknown diagnostic scope: ${scope}`));
        console.error(chalk.cyan('Available scopes: repository, publishing, workflow, all'));
        process.exit(2);
      }

      await diagnoseSystem(scope, options);
    } catch (error) {
      console.error(chalk.red(`\n❌ Diagnosis failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Oracle Intelligence Analysis commands
program
  .command('intelligent-analysis')
  .alias('ai')
  .description('Run Oracle Intelligence deployment analysis')
  .option('--json', 'output results in JSON format for CI/CD integration')
  .option('--package <package>', 'analyze specific package only')
  .option('--fail-on-conflicts', 'fail if conflicts are detected')
  .option('--confidence-threshold <number>', 'minimum confidence threshold (0.0-1.0)', '0.7')
  .action(async options => {
    try {
      console.log(chalk.blue.bold('\n🧠 Running Oracle Intelligence Analysis...\n'));

      // Temporarily execute as subprocess to avoid argument parsing conflicts
      const { execSync } = await import('child_process');

      const args = [];
      if (options.json) args.push('--json');
      if (options.package) args.push('--package', options.package);
      if (options.failOnConflicts) args.push('--fail-on-conflicts');
      if (options.confidenceThreshold)
        args.push('--confidence-threshold', options.confidenceThreshold);

      const command = `node ${new URL('./commands/intelligent-analysis.js', import.meta.url).pathname} ${args.join(' ')}`;

      try {
        const result = execSync(command, {
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'inherit',
        });
        console.log(result);
      } catch (error) {
        // The subprocess already handles error output
        if (error.status !== 0) {
          process.exit(error.status);
        }
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Oracle Intelligence Analysis failed: ${error.message}\n`));
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .alias('st')
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
  await verifyPackageConfig();
  console.log(chalk.green('\n✅ All verifications completed!\n'));
}

async function verifyPackageConfig() {
  const spinner = ora('Verifying package configurations...').start();

  try {
    // Import Smart Package Analyzer for comprehensive verification
    const { getSmartPackageAnalysis } = await import('./commands/npm-publishing.js');
    const analysis = await getSmartPackageAnalysis();

    spinner.succeed('Package configurations loaded');

    console.log(chalk.blue('\n📦 Package Configuration Verification:\n'));

    let totalPackages = 0;
    let validPackages = 0;
    const issues = [];

    for (const pkg of analysis.packages) {
      totalPackages++;

      // Check package.json essentials
      const pkgIssues = [];

      if (!pkg.name || !pkg.version) {
        pkgIssues.push('Missing name or version');
      }

      if (pkg.private) {
        continue; // Skip private packages
      }

      // Check for essential fields - define packageJson first
      const packageJson = pkg.packageJson || {};

      // Check publishConfig for scoped packages
      if (pkg.name.startsWith('@') && !packageJson.publishConfig) {
        pkgIssues.push('Missing publishConfig for scoped package');
      }

      if (packageJson.publishConfig && packageJson.publishConfig.access !== 'public') {
        pkgIssues.push('publishConfig should have access: public');
      }

      if (!packageJson.description) {
        pkgIssues.push('Missing description');
      }

      if (!packageJson.license) {
        pkgIssues.push('Missing license');
      }

      if (!packageJson.keywords || packageJson.keywords.length === 0) {
        pkgIssues.push('Missing keywords');
      }

      // Category-based checks
      switch (pkg.category) {
        case 'version-downgrade':
          pkgIssues.push('Version downgrade detected - current version lower than published');
          break;
        case 'new-package':
          // New packages should have publishConfig
          if (!packageJson.publishConfig) {
            pkgIssues.push('New packages need publishConfig with public access');
          }
          break;
        case 'updated-package':
          // Updated packages should consider version bump
          pkgIssues.push('Package has changes but version not bumped');
          break;
      }

      const icon = pkgIssues.length === 0 ? '✅' : '⚠️';
      const status = pkgIssues.length === 0 ? 'Valid' : 'Issues Found';

      console.log(`${icon} ${pkg.name}@${pkg.version}: ${status}`);

      if (pkgIssues.length > 0) {
        pkgIssues.forEach(issue => console.log(chalk.yellow(`   • ${issue}`)));
      } else {
        validPackages++;
      }

      console.log('');
    }

    // Display summary
    console.log(chalk.blue('📊 Verification Summary:'));
    console.log(`  Total packages: ${totalPackages}`);
    console.log(`  Valid packages: ${chalk.green(validPackages)}`);
    console.log(`  Packages with issues: ${chalk.yellow(issues.length)}`);

    if (issues.length > 0) {
      console.log(chalk.red('\n⚠️  Issues Found:'));
      issues.forEach(issue => console.log(`  • ${issue}`));
      spinner.warn('Package configuration verification completed with issues');
      return false;
    }

    spinner.succeed('All package configurations are valid');
    return true;
  } catch (error) {
    spinner.fail('Package configuration verification failed');
    console.error(chalk.red(`Error: ${error.message}`));
    return false;
  }
}

async function getDeploymentStatus() {
  try {
    // Import necessary functions from existing modules
    const { findWorkspacePackages, checkGitHubAuth, getRepositoryInfo } = await import(
      './commands/npm-publishing.js'
    );
    const { checkWorkflowExists } = await import('./utils/github-cli.js');

    // Step 1: Get workspace packages using existing function
    const packages = await findWorkspacePackages();

    // Step 2: Check repository status
    const repoInfo = await getRepositoryInfo();
    const { authenticated } = checkGitHubAuth();

    // Step 3: Check CI/CD workflow status
    const workflowExists = checkWorkflowExists();

    // Step 4: Check trusted publishing setup (basic heuristic)
    const trustedPublishing = authenticated && !!repoInfo;

    return {
      repository: {
        configured: !!repoInfo,
        trustedPublishing: trustedPublishing,
        cicd: workflowExists,
      },
      packages: packages
        .filter(pkg => !pkg.private) // Only include public packages
        .map(pkg => ({
          name: pkg.name,
          published: pkg.published,
          version: pkg.version,
        })),
    };
  } catch (error) {
    console.error(chalk.red(`❌ Status check failed: ${error.message}`));
    // Return basic error state instead of throwing to avoid breaking the UI
    return {
      repository: {
        configured: false,
        trustedPublishing: false,
        cicd: false,
        error: error.message,
      },
      packages: [],
      error: error.message,
    };
  }
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

// Run CLI - Robust check for when this file is executed directly or via binary
const isMainModule = () => {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const executedFile = process.argv[1];

    // Method 1: Direct file comparison (most reliable)
    if (currentFile === executedFile) {
      return true;
    }

    // Method 2: Check if executed file is a binary that points to this file
    // This handles npx/bunx symlinks and package managers
    const pathSeparator = process.platform === 'win32' ? '\\' : '/';
    const executedFileName = executedFile.split(pathSeparator).pop();
    const currentFileName = currentFile.split(pathSeparator).pop();

    // Check if the executed file is a known binary name and current file is index.js
    if (
      (executedFileName === 'dawlabs-cli' || executedFileName === 'cli') &&
      currentFileName === 'index.js'
    ) {
      return true;
    }

    // Method 3: Fallback - check if this is the main module
    if (import.meta.url === `file://${executedFile}`) {
      return true;
    }

    // Method 4: Additional fallback - normalize paths and compare
    const normalizePath = path => {
      return path.replace(/^\/private\//, '/');
    };

    if (normalizePath(currentFile) === normalizePath(executedFile)) {
      return true;
    }

    return false;
  } catch {
    // If anything fails, fall back to basic check
    return import.meta.url === `file://${process.argv[1]}`;
  }
};

/**
 * Execute setup command without process.exit
 */
async function executeSetupCommand(type, options = {}) {
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
        return { success: false, error: 'Missing dependencies' };
      }
    }

    // Set interactive mode as default for interactive menu
    const setupOptions = {
      ...options,
      interactive: options.noInteractive !== true, // Default to interactive unless explicitly disabled
    };

    // Validate setup type before processing
    const validTypes = ['npm-publishing', 'cicd-workflow', 'repository', 'all'];
    if (!validTypes.includes(type)) {
      console.error(chalk.red(`\n❌ Unknown setup type: ${type}`));
      console.error(chalk.cyan('Available types: npm-publishing, cicd-workflow, repository, all'));
      return { success: false, error: 'Unknown setup type' };
    }

    switch (type) {
      case 'npm-publishing':
        await setupNpmPublishing(setupOptions);
        break;
      case 'cicd-workflow':
        await setupCicdWorkflow(setupOptions);
        break;
      case 'repository':
        await setupRepositoryConfig(setupOptions);
        break;
      case 'all':
        await setupAll(setupOptions);
        break;
    }

    if (options.autoVerify) {
      console.log(chalk.green('\n✅ Setup completed! Running verification...\n'));
    }

    return { success: true };
  } catch (error) {
    console.error(chalk.red(`\n❌ Setup failed: ${error.message}\n`));
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Execute verify command without process.exit
 */
async function executeVerifyCommand(type) {
  try {
    console.log(chalk.blue.bold(`\n🔍 Verifying ${type}...\n`));

    // Validate verification type
    const validTypes = ['npm-publishing', 'cicd-workflow', 'package-config', 'all'];
    if (!validTypes.includes(type)) {
      console.error(chalk.red(`\n❌ Unknown verification type: ${type}`));
      console.error(
        chalk.cyan('Available types: npm-publishing, cicd-workflow, package-config, all'),
      );
      return { success: false, error: 'Unknown verification type' };
    }

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
        return { success: false, error: 'Missing dependencies' };
      }
    }

    switch (type) {
      case 'npm-publishing':
        return await verifyNpmPublishing();
      case 'cicd-workflow':
        return await verifyCicdWorkflow();
      case 'package-config':
        return await verifyPackageConfig();
      case 'all':
        return await verifyAll();
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Verification failed: ${error.message}\n`));
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Execute diagnose command without process.exit
 */
async function executeDiagnoseCommand(scope, options = {}) {
  try {
    console.log(chalk.blue.bold(`\n🩺 Diagnosing ${scope}...\n`));

    // Validate diagnostic scope
    const validScopes = ['repository', 'publishing', 'workflow', 'all'];
    if (!validScopes.includes(scope)) {
      console.error(chalk.red(`\n❌ Unknown diagnostic scope: ${scope}`));
      console.error(chalk.cyan('Available scopes: repository, publishing, workflow, all'));
      return { success: false, error: 'Unknown diagnostic scope' };
    }

    await diagnoseSystem(scope, options);
    return { success: true };
  } catch (error) {
    console.error(chalk.red(`\n❌ Diagnosis failed: ${error.message}\n`));
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Execute intelligent analysis command without process.exit
 */
async function executeIntelligentAnalysisCommand(options = {}) {
  try {
    console.log(chalk.blue.bold('\n🧠 Running Oracle Intelligence Analysis...\n'));

    // Import the intelligent analysis command module and execute it directly
    const { main } = await import('./commands/intelligent-analysis.js');

    // Set up command line arguments for the intelligent-analysis module
    const originalArgv = process.argv;
    const args = ['intelligent-analysis'];

    if (options.json) args.push('--json');
    if (options.package) args.push('--package', options.package);
    if (options.failOnConflicts) args.push('--fail-on-conflicts');
    if (options.confidenceThreshold)
      args.push('--confidence-threshold', options.confidenceThreshold.toString());

    // Temporarily replace process.argv for the command
    process.argv = ['node', 'intelligent-analysis', ...args];

    await main();

    // Restore original process.argv
    process.argv = originalArgv;

    return { success: true };
  } catch (error) {
    console.error(chalk.red(`\n❌ Oracle Intelligence Analysis failed: ${error.message}\n`));
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Execute status command without process.exit
 */
async function executeStatusCommand(options = {}) {
  try {
    const status = await getDeploymentStatus();

    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      displayStatus(status);
    }

    return { success: true };
  } catch (error) {
    console.error(chalk.red(`\n❌ Status check failed: ${error.message}\n`));
    if (program.opts().verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Interactive menu for when no command is provided
 */
async function showInteractiveMenu() {
  while (true) {
    // Keep running until user chooses to exit
    console.log(chalk.blue.bold('\n🚀 DAWLabs Internal CLI Tool\n'));
    console.log(chalk.gray('Choose an action:'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          {
            name: '🔧 Setup deployment configurations [s]',
            value: 'setup',
          },
          {
            name: '✅ Verify deployment configurations [v]',
            value: 'verify',
          },
          {
            name: '🩺 Diagnose deployment issues [d]',
            value: 'diagnose',
          },
          {
            name: '🧠 Run Oracle Intelligence analysis [ai]',
            value: 'intelligent-analysis',
          },
          {
            name: '📊 Show current deployment status [st]',
            value: 'status',
          },
          {
            name: '🚪 Exit [q, exit]',
            value: 'exit',
          },
        ],
        pageSize: 10,
      },
    ]);

    // Handle shortcuts if user types them directly
    // Inquirer will still work with arrow keys, shortcuts are shown for documentation

    if (action === 'exit') {
      console.log(chalk.green('\n👋 Goodbye!\n'));
      process.exit(0);
    }

    // For commands that require arguments, prompt for them
    const args = [];
    const options = {};

    if (action === 'setup') {
      const { type } = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Setup type:',
          choices: [
            { name: 'NPM Publishing Configuration', value: 'npm-publishing' },
            { name: 'CI/CD Workflow Setup', value: 'cicd-workflow' },
            { name: 'Repository Configuration', value: 'repository' },
            { name: 'Complete Setup (All)', value: 'all' },
          ],
        },
      ]);
      args.push(type);

      // Ask if user wants auto-verify
      const { autoVerify } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'autoVerify',
          message: 'Automatically verify after setup?',
          default: false,
        },
      ]);
      if (autoVerify) {
        options.autoVerify = true;
      }
    } else if (action === 'verify') {
      const { type } = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Verify type:',
          choices: [
            { name: 'NPM Publishing Configuration', value: 'npm-publishing' },
            { name: 'CI/CD Workflow Configuration', value: 'cicd-workflow' },
            { name: 'Package Configuration', value: 'package-config' },
            { name: 'All Configurations', value: 'all' },
          ],
        },
      ]);
      args.push(type);
    } else if (action === 'diagnose') {
      const { scope } = await inquirer.prompt([
        {
          type: 'list',
          name: 'scope',
          message: 'Diagnostic scope:',
          choices: [
            { name: 'Repository Configuration', value: 'repository' },
            { name: 'Publishing Configuration', value: 'publishing' },
            { name: 'Workflow Configuration', value: 'workflow' },
            { name: 'All Scopes', value: 'all' },
          ],
        },
      ]);
      args.push(scope);

      // Ask if user wants to fix issues
      const { fixIssues } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'fixIssues',
          message: 'Attempt to fix detected issues?',
          default: false,
        },
      ]);
      if (fixIssues) {
        options.fix = true;
      }
    } else if (action === 'intelligent-analysis') {
      const { outputFormat } = await inquirer.prompt([
        {
          type: 'list',
          name: 'outputFormat',
          message: 'Output format:',
          choices: [
            { name: 'Colored output (default)', value: 'colored' },
            { name: 'JSON format', value: 'json' },
          ],
          default: 'colored',
        },
      ]);
      if (outputFormat === 'json') {
        options.json = true;
      }

      const { analyzePackage } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'analyzePackage',
          message: 'Analyze a specific package only?',
          default: false,
        },
      ]);
      if (analyzePackage) {
        const { packageName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'packageName',
            message: 'Package name (e.g., @dawlabs/ncurl):',
            validate: input => input.trim().length > 0 || 'Package name is required',
          },
        ]);
        options.package = packageName.trim();
      }
    } else if (action === 'status') {
      const { outputFormat } = await inquirer.prompt([
        {
          type: 'list',
          name: 'outputFormat',
          message: 'Output format:',
          choices: [
            { name: 'Colored output (default)', value: 'colored' },
            { name: 'JSON format', value: 'json' },
          ],
          default: 'colored',
        },
      ]);
      if (outputFormat === 'json') {
        options.json = true;
      }
    }

    // Execute the selected command with arguments
    try {
      let result;

      switch (action) {
        case 'setup':
          result = await executeSetupCommand(args[0], options);
          break;
        case 'verify':
          result = await executeVerifyCommand(args[0]);
          break;
        case 'diagnose':
          result = await executeDiagnoseCommand(args[0], options);
          break;
        case 'intelligent-analysis':
          result = await executeIntelligentAnalysisCommand(options);
          break;
        case 'status':
          result = await executeStatusCommand(options);
          break;
      }

      // Show completion message
      if (result && result.success) {
        console.log(chalk.green('\n✅ Command completed successfully!\n'));
      } else {
        console.log(chalk.yellow('\n⚠️  Command completed with issues.\n'));
      }

      // Ask if user wants to return to main menu
      const { returnToMain } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'returnToMain',
          message: 'Return to main? otherwise Quit.',
          default: true,
        },
      ]);

      if (!returnToMain) {
        console.log(chalk.green('\n👋 Goodbye!\n'));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error executing command: ${error.message}\n`));

      // Ask if user wants to return to main despite error
      const { returnToMain } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'returnToMain',
          message: 'Return to main? otherwise Quit.',
          default: true,
        },
      ]);

      if (!returnToMain) {
        console.log(chalk.green('\n👋 Goodbye!\n'));
        process.exit(0);
      }
    }
  }
}

if (isMainModule()) {
  // Check if no command is provided (i.e., just the binary was executed)
  if (process.argv.length <= 2) {
    showInteractiveMenu().catch(error => {
      console.error(chalk.red(`\n❌ Interactive menu failed: ${error.message}\n`));
      process.exit(1);
    });
  } else {
    program.parse();
  }
}
