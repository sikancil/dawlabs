import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

import { setupNpmPublishing } from './npm-publishing.js';
import { setupRepositoryConfig } from './repository-setup.js';
import { getRepositoryInfo } from '../utils/github-cli.js';
import { validateMonorepoConfig } from '../utils/validators.js';

export async function setupAll(options = {}) {
  let spinner = ora('Setting up complete deployment pipeline...').start();

  try {
    // Step 1: Validate current setup
    spinner.text = 'Validating current configuration...';
    const validation = validateMonorepoConfig();

    if (!validation.valid) {
      spinner.fail('Configuration validation failed');
      console.log(chalk.red('\n❌ Configuration Errors:'));
      validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Configuration Warnings:'));
        validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      }

      if (options.interactive) {
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Configuration has issues. Do you want to proceed anyway?',
            default: false,
          },
        ]);

        if (!proceed) {
          process.exit(1);
        }
      } else {
        // In non-interactive mode, fail on configuration errors
        throw new Error('Fix configuration errors before proceeding or use --interactive flag');
      }
    }
    spinner.succeed('Configuration validation completed');

    // Step 2: Get repository information
    spinner.text = 'Getting repository information...';
    const repoInfo = await getRepositoryInfo();
    spinner.succeed(`Repository: ${repoInfo.name}`);

    // Step 3: Setup repository configuration
    spinner.text = 'Setting up repository configuration...';
    if (options.interactive) {
      spinner.stop();
      await setupRepositoryConfig({ ...options, repoInfo });
      spinner = ora('Repository configuration completed').start();
    } else {
      spinner.succeed('Repository configuration skipped (interactive mode is default)');
    }

    // Step 4: Setup NPM publishing
    spinner.text = 'Setting up NPM publishing...';
    await setupNpmPublishing({ ...options, repoInfo });
    spinner.succeed('NPM publishing setup completed');

    // Step 5: Show next steps
    spinner.stop();
    console.log(chalk.green.bold('\n🎉 Deployment setup completed successfully!\n'));

    console.log(chalk.blue('Next Steps:'));
    console.log('1. Configure NPM trusted publishing for your packages');
    console.log('2. Test the workflow: gh workflow run release.yml');
    console.log('3. Create changesets for version management');
    console.log('4. Monitor automatic publishing on merge to main\n');

    console.log(chalk.cyan('Useful Commands:'));
    console.log('  node tools/internal-cli/index.js status     - Check deployment status');
    console.log('  node tools/internal-cli/index.js diagnose   - Troubleshoot issues');
    console.log('  node tools/internal-cli/index.js verify     - Verify configurations\n');
  } catch (error) {
    spinner.fail('Setup failed');
    throw error;
  }
}
