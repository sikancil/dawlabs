import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

import { getRepositoryInfo, checkWorkflowExists, getWorkflowStatus } from '../utils/github-cli.js';
import { checkNpmPackage } from '../utils/npm-api.js';
import { validateMonorepoConfig, validateWorkflowConfig } from '../utils/validators.js';

export async function diagnoseSystem(scope, options = {}) {
  const spinner = ora(`Diagnosing ${scope}...`).start();

  try {
    switch (scope) {
      case 'repository':
        await diagnoseRepository(spinner);
        break;
      case 'publishing':
        await diagnosePublishing(spinner);
        break;
      case 'workflow':
        await diagnoseWorkflow(spinner);
        break;
      case 'all':
        await diagnoseAll(spinner, options);
        break;
      default:
        throw new Error(`Unknown diagnostic scope: ${scope}`);
    }

    spinner.stop();
  } catch (error) {
    spinner.fail('Diagnosis failed');
    throw error;
  }
}

async function diagnoseRepository(spinner) {
  console.log(chalk.blue('\n🔍 Repository Diagnosis:\n'));

  // Check if we're in a git repository
  spinner.text = 'Checking git repository...';
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    console.log(chalk.green('✅ Git repository detected'));
  } catch (error) {
    console.log(chalk.red('❌ Not a git repository'));
    spinner.fail('Repository diagnosis failed');
    return;
  }

  // Check GitHub CLI
  spinner.text = 'Checking GitHub CLI...';
  try {
    execSync('gh --version', { stdio: 'ignore' });
    console.log(chalk.green('✅ GitHub CLI installed'));
  } catch (error) {
    console.log(chalk.red('❌ GitHub CLI not installed'));
    console.log(chalk.yellow('Install GitHub CLI: https://cli.github.com/'));
    return;
  }

  // Check GitHub authentication
  spinner.text = 'Checking GitHub authentication...';
  try {
    const authStatus = execSync('gh auth status', { encoding: 'utf8' });
    if (authStatus.includes('Logged in')) {
      console.log(chalk.green('✅ GitHub CLI authenticated'));
    } else {
      console.log(chalk.red('❌ GitHub CLI not authenticated'));
      console.log(chalk.yellow('Run: gh auth login'));
      return;
    }
  } catch (error) {
    console.log(chalk.red('❌ GitHub CLI authentication failed'));
    return;
  }

  // Check repository information
  spinner.text = 'Getting repository information...';
  try {
    const repoInfo = await getRepositoryInfo();
    console.log(chalk.green(`✅ Repository: ${repoInfo.owner.login}/${repoInfo.name}`));
    console.log(`   Main branch: ${repoInfo.defaultBranchRef.name}`);
    console.log(`   Private: ${repoInfo.isPrivate ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(chalk.red('❌ Could not get repository information'));
    console.log(chalk.yellow("Make sure you're in a GitHub repository"));
    return;
  }

  spinner.succeed('Repository diagnosis completed');
}

async function diagnosePublishing(spinner) {
  console.log(chalk.blue('\n📦 Publishing Diagnosis:\n'));

  // Check NPM authentication
  spinner.text = 'Checking NPM authentication...';
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8', stdio: 'pipe' });
    console.log(chalk.green(`✅ NPM authenticated as: ${whoami.trim()}`));
  } catch (error) {
    console.log(chalk.red('❌ Not authenticated with NPM'));
    console.log(chalk.yellow('Run: npm login'));
    return;
  }

  // Check if NPM token has required permissions
  spinner.text = 'Checking NPM permissions...';
  try {
    const npmConfig = execSync('npm config list --json', { encoding: 'utf8' });
    const config = JSON.parse(npmConfig);

    if (config.provenance) {
      console.log(chalk.green('✅ NPM provenance enabled'));
    } else {
      console.log(chalk.yellow('⚠️  NPM provenance not enabled'));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not check NPM configuration'));
  }

  // Scan packages
  spinner.text = 'Scanning workspace packages...';
  try {
    const packages = await getWorkspacePackages();
    console.log(chalk.green(`✅ Found ${packages.length} packages`));

    for (const pkg of packages) {
      if (pkg.name && !pkg.name.includes('monorepo')) {
        const isPublished = checkNpmPackage(pkg.name);
        const status = isPublished ? '✅ Published' : '❌ Not Published';
        console.log(`   ${status} ${pkg.name}@${pkg.version}`);
      }
    }
  } catch (error) {
    console.log(chalk.red('❌ Could not scan workspace packages'));
  }

  // Check if packages have proper configuration
  spinner.text = 'Checking package configurations...';
  await checkPackageConfigurations();

  spinner.succeed('Publishing diagnosis completed');
}

async function diagnoseWorkflow(spinner) {
  console.log(chalk.blue('\n🔄 Workflow Diagnosis:\n'));

  // Check workflow file exists
  spinner.text = 'Checking workflow files...';
  if (!existsSync('.github/workflows')) {
    console.log(chalk.red('❌ .github/workflows directory not found'));
    return;
  }

  if (!checkWorkflowExists()) {
    console.log(chalk.red('❌ Release workflow not found'));
    console.log(chalk.yellow('Expected: .github/workflows/release.yml'));
    return;
  }

  console.log(chalk.green('✅ Release workflow found'));

  // Validate workflow configuration
  spinner.text = 'Validating workflow configuration...';
  const validation = validateWorkflowConfig();

  if (validation.valid) {
    console.log(chalk.green('✅ Workflow configuration is valid'));
  } else {
    console.log(chalk.red('❌ Workflow configuration has errors'));
    validation.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
  }

  if (validation.warnings.length > 0) {
    console.log(chalk.yellow('⚠️  Workflow warnings:'));
    validation.warnings.forEach(warning => console.log(chalk.yellow(`   • ${warning}`)));
  }

  // Check recent workflow runs
  spinner.text = 'Checking recent workflow runs...';
  const recentRun = getWorkflowStatus();

  if (recentRun) {
    const statusIcon = recentRun.status === 'completed' ? '✅' : '⚠️';
    const conclusionIcon = recentRun.conclusion === 'success' ? '✅' : '❌';

    console.log(chalk.green(`${statusIcon} Recent workflow run:`));
    console.log(`   Status: ${recentRun.status}`);
    console.log(`   Conclusion: ${conclusionIcon} ${recentRun.conclusion || 'pending'}`);
    console.log(`   Created: ${new Date(recentRun.createdAt).toLocaleString()}`);
  } else {
    console.log(chalk.yellow('⚠️  No recent workflow runs'));
    console.log(chalk.cyan('   Trigger a test: gh workflow run release.yml'));
  }

  spinner.succeed('Workflow diagnosis completed');
}

async function diagnoseAll(spinner, options) {
  console.log(chalk.blue.bold('\n🩺 Complete System Diagnosis:\n'));

  // Repository checks
  await diagnoseRepository(spinner);
  console.log('');

  // Workflow checks
  await diagnoseWorkflow(spinner);
  console.log('');

  // Publishing checks
  await diagnosePublishing(spinner);
  console.log('');

  // Monorepo configuration
  console.log(chalk.blue('🏗️  Monorepo Configuration:\n'));
  const monorepoValidation = validateMonorepoConfig();

  if (monorepoValidation.valid) {
    console.log(chalk.green('✅ Monorepo configuration is valid'));
  } else {
    console.log(chalk.red('❌ Monorepo configuration has errors'));
    monorepoValidation.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
  }

  if (monorepoValidation.warnings.length > 0) {
    console.log(chalk.yellow('⚠️  Monorepo warnings:'));
    monorepoValidation.warnings.forEach(warning => console.log(chalk.yellow(`   • ${warning}`)));
  }

  // Summary
  console.log(chalk.bold('\n📊 Diagnosis Summary:'));
  const totalErrors = monorepoValidation.errors.length;
  const totalWarnings = monorepoValidation.warnings.length;

  if (totalErrors === 0) {
    console.log(chalk.green('✅ No critical issues detected'));
  } else {
    console.log(chalk.red(`❌ ${totalErrors} critical issue(s) found`));
  }

  if (totalWarnings > 0) {
    console.log(chalk.yellow(`⚠️  ${totalWarnings} warning(s) found`));
  }

  if (options.fix) {
    console.log(chalk.blue('\n🔧 Attempting to fix issues...'));
    await attemptFixes(monorepoValidation);
  }
}

async function checkPackageConfigurations() {
  try {
    const packages = await getWorkspacePackages();

    for (const pkg of packages) {
      if (pkg.name && !pkg.name.includes('monorepo')) {
        const packagePath = pkg.path || pkg.name;
        const config = await import('../utils/npm-api.js').then(m =>
          m.checkPackageConfig(packagePath),
        );

        if (!config.valid) {
          console.log(chalk.red(`   ❌ ${pkg.name}: Configuration issues`));
          config.errors.forEach(error => console.log(chalk.red(`      • ${error}`)));
        } else {
          console.log(chalk.green(`   ✅ ${pkg.name}: Configuration valid`));
        }

        if (config.warnings.length > 0) {
          config.warnings.forEach(warning => console.log(chalk.yellow(`      ⚠️  ${warning}`)));
        }
      }
    }
  } catch (error) {
    console.log(chalk.red('❌ Could not check package configurations'));
  }
}

async function attemptFixes(validation) {
  const spinner = ora('Attempting fixes...').start();

  try {
    // This would contain automated fixes
    // For now, just show what would be fixed
    spinner.succeed('Fix recommendations provided');
    console.log(chalk.cyan('\n🔧 Suggested fixes:'));

    if (validation.errors.length > 0) {
      console.log(chalk.red('\nCritical fixes needed:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('\nRecommended improvements:'));
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }
  } catch (error) {
    spinner.fail('Failed to apply fixes');
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

async function getWorkspacePackages() {
  try {
    const output = execSync('pnpm ls --recursive --depth=0 --json', { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    return [];
  }
}
