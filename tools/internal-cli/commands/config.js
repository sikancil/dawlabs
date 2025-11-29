import chalk from 'chalk';
import ora from 'ora';
import { ConfigManager } from '../utils/config-manager.js';

/**
 * Configuration Management Commands
 */
export function setupConfigCommand(program) {
  const configCommand = program
    .command('config')
    .description('Manage monorepo configuration files');

  // Initialize configuration
  configCommand
    .command('init')
    .description('Initialize missing configuration files from templates')
    .option('--identity', 'Initialize only identity configuration')
    .option('--deployment', 'Initialize only deployment configuration')
    .option('--force', 'Overwrite existing configuration files')
    .option('--interactive', 'Interactive configuration setup')
    .action(async options => {
      const spinner = ora('Initializing configuration files...').start();

      try {
        const configManager = new ConfigManager();

        if (options.identity || (!options.deployment && !options.identity)) {
          spinner.text = 'Initializing identity configuration...';
          configManager.initializeIdentityConfig({
            interactive: options.interactive,
            force: options.force,
          });
          spinner.succeed('Identity configuration initialized');
        }

        if (options.deployment || (!options.deployment && !options.identity)) {
          spinner.text = 'Initializing deployment configuration...';
          configManager.initializeDeploymentConfig({
            interactive: options.interactive,
            force: options.force,
          });
          spinner.succeed('Deployment configuration initialized');
        }

        console.log(chalk.green('\n✅ Configuration initialization completed!'));
        console.log(chalk.cyan('Files created:'));
        console.log(`  • .identity.dawlabs.json`);
        console.log(`  • tools/internal-cli/config/deployment.json`);
      } catch (_error) {
        spinner.fail('Configuration initialization failed');
        console.error(chalk.red(`Error: ${_error.message}`));
        process.exit(1);
      }
    });

  // Validate configuration
  configCommand
    .command('validate')
    .description('Validate configuration files for completeness and correctness')
    .action(async () => {
      const spinner = ora('Validating configuration files...').start();

      try {
        const configManager = new ConfigManager();
        const issues = configManager.validateConfigs();

        spinner.succeed('Configuration validation completed');

        if (issues.length === 0) {
          console.log(chalk.green('\n✅ All configuration files are valid!'));
        } else {
          console.log(chalk.yellow(`\n⚠️  Found ${issues.length} issue(s):\n`));

          const errors = issues.filter(issue => issue.type === 'error');
          const warnings = issues.filter(issue => issue.type === 'warning');

          if (errors.length > 0) {
            console.log(chalk.red.bold('Errors:'));
            errors.forEach(issue => {
              console.log(chalk.red(`  ❌ ${issue.file}: ${issue.message}`));
            });
            console.log();
          }

          if (warnings.length > 0) {
            console.log(chalk.yellow.bold('Warnings:'));
            warnings.forEach(issue => {
              console.log(chalk.yellow(`  ⚠️  ${issue.file}: ${issue.message}`));
            });
          }
        }
      } catch (_error) {
        spinner.fail('Configuration validation failed');
        console.error(chalk.red(`Error: ${_error.message}`));
        process.exit(1);
      }
    });

  // Show configuration
  configCommand
    .command('show')
    .description('Display current configuration values')
    .option('--identity', 'Show only identity configuration')
    .option('--deployment', 'Show only deployment configuration')
    .action(async options => {
      try {
        const configManager = new ConfigManager();
        const type = options.identity ? 'identity' : options.deployment ? 'deployment' : 'all';

        configManager.displayConfig(type);
      } catch (_error) {
        console.error(chalk.red(`Error: ${_error.message}`));
        process.exit(1);
      }
    });

  // Update configuration
  configCommand
    .command('update')
    .description('Update configuration files with current discoveries')
    .option('--packages', 'Update with discovered packages')
    .action(async () => {
      const spinner = ora('Updating configuration files...').start();

      try {
        const configManager = new ConfigManager();
        const updates = configManager.updateConfigs();

        spinner.succeed('Configuration update completed');

        const successful = updates.filter(update => update.type === 'updated');
        const errors = updates.filter(update => update.type === 'error');

        if (successful.length > 0) {
          console.log(chalk.green('\n✅ Updates applied:'));
          successful.forEach(update => {
            console.log(chalk.green(`  ✓ ${update.file}: ${update.message}`));
          });
        }

        if (errors.length > 0) {
          console.log(chalk.red('\n❌ Errors encountered:'));
          errors.forEach(update => {
            console.log(chalk.red(`  ❌ ${update.file}: ${update.message}`));
          });
        }
      } catch (_error) {
        spinner.fail('Configuration update failed');
        console.error(chalk.red(`Error: ${_error.message}`));
        process.exit(1);
      }
    });

  // Reset configuration
  configCommand
    .command('reset')
    .description('Reset configuration files from templates')
    .option('--identity', 'Reset only identity configuration')
    .option('--deployment', 'Reset only deployment configuration')
    .option('--force', 'Skip confirmation prompt')
    .action(async options => {
      try {
        const configManager = new ConfigManager();
        const type = options.identity ? 'identity' : options.deployment ? 'deployment' : 'all';

        if (!options.force) {
          const { confirm } = await import('inquirer').then(({ default: inquirer }) =>
            inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to reset ${type} configuration(s)? This will overwrite your current settings.`,
                default: false,
              },
            ]),
          );

          if (!confirm) {
            console.log(chalk.yellow('Configuration reset cancelled.'));
            return;
          }
        }

        const spinner = ora('Resetting configuration files...').start();
        const results = configManager.resetConfigs({ type, force: true });

        spinner.succeed('Configuration reset completed');

        const successful = results.filter(result => result.type === 'success');
        const errors = results.filter(result => result.type === 'error');

        if (successful.length > 0) {
          console.log(chalk.green('\n✅ Reset completed:'));
          successful.forEach(result => {
            console.log(chalk.green(`  ✓ ${result.file}: ${result.message}`));
          });
        }

        if (errors.length > 0) {
          console.log(chalk.red('\n❌ Errors encountered:'));
          errors.forEach(result => {
            console.log(chalk.red(`  ❌ ${result.file}: ${result.message}`));
          });
        }
      } catch (_error) {
        console.error(chalk.red(`Error: ${_error.message}`));
        process.exit(1);
      }
    });
}
