import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import open from 'open';
import clipboardy from 'clipboardy';

// Import utilities
import { getRepositoryInfo } from '../utils/github-cli.js';
import { checkNpmPackage } from '../utils/npm-api.js';
import { validatePackageJson } from '../utils/validators.js';

/**
 * Helper function to open npm access page in browser
 */
async function openNpmAccessPage(packageName) {
  const url = `https://www.npmjs.com/package/${packageName}/access`;

  try {
    await open(url);
    console.log(chalk.green(`✅ Browser opened: ${url}`));
    return true;
  } catch {
    console.log(chalk.red(`❌ Could not open browser. Please manually visit: ${url}`));
    return false;
  }
}

/**
 * Helper function to copy text to clipboard
 */
async function copyToClipboard(content, label) {
  try {
    await clipboardy.write(content);
    console.log(chalk.green(`✅ Copied ${label} to clipboard`));
    return true;
  } catch {
    console.log(chalk.red(`❌ Could not copy ${label}. Please copy manually: ${content}`));
    return false;
  }
}

/**
 * Display categorized packages list
 */
function displayCategorizedPackages(packages, targetPackage = null) {
  if (targetPackage) {
    // Show only the targeted package
    console.log(chalk.blue(`\n🎯 Target Package:`));
    const pkg = packages.find(
      p =>
        p.name === targetPackage ||
        p.name === `@dawlabs/${targetPackage}` ||
        p.name.endsWith(`/${targetPackage}`),
    );

    if (pkg) {
      const status = pkg.published ? '✅' : '❌';
      const category = pkg.published ? 'Existing' : 'New';
      console.log(`  ${status} ${chalk.white(category)}: ${pkg.name}@${pkg.version}`);
    } else {
      console.log(chalk.red(`  ❌ Package not found: ${targetPackage}`));
      console.log(chalk.yellow(`  💡 Available packages:`));
      packages.forEach(p => console.log(`     • ${p.name}@${p.version}`));
    }
    return;
  }

  // Show categorized list for all packages
  const newPackages = packages.filter(pkg => !pkg.published);
  const existingPackages = packages.filter(pkg => pkg.published);

  console.log(chalk.blue('\n📦 Workspace Packages:'));

  if (newPackages.length > 0) {
    console.log(chalk.cyan('\n🆕 New Packages (Setup Required):'));
    newPackages.forEach(pkg => {
      console.log(`  ❌ ${chalk.white(pkg.name)}@${pkg.version}`);
    });
  }

  if (existingPackages.length > 0) {
    console.log(chalk.green('\n✅ Existing Packages (Already Published):'));
    existingPackages.forEach(pkg => {
      console.log(`  ✅ ${chalk.white(pkg.name)}@${pkg.version}`);
    });
  }

  if (packages.length === 0) {
    console.log(chalk.yellow('\n  No packages found in workspace'));
  }
}

/**
 * Display formatted setup instructions with auto-actions
 */
async function displaySetupInstructions(packageName, repoInfo) {
  const repositoryFullName = `${repoInfo.owner.login}/${repoInfo.name}`;

  console.log(`
${chalk.cyan('┌─ NPM TRUSTED PUBLISHING SETUP ─────────────────────────────────┐')}
${chalk.cyan('│')} ${chalk.white(`📦 Package: ${packageName}`)}${' '.repeat(56 - packageName.length)}${chalk.cyan('│')}
${chalk.cyan('│                                                                │')}
${chalk.cyan('│')} ${chalk.yellow('🌐 Auto-opening browser...')}${' '.repeat(46)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.yellow('📋 Auto-copying values to clipboard...')}${' '.repeat(33)}${chalk.cyan('│')}
${chalk.cyan('│                                                                │')}
${chalk.cyan('│')} ${chalk.white('Manual Reference (if needed):')}${' '.repeat(33)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.gray('─'.repeat(63))}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.white(`URL:            https://www.npmjs.com/package/${packageName}/access`)}${' '.repeat(0)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.white(`Repository:     ${repositoryFullName}`)}${' '.repeat(28 - repositoryFullName.length)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.white('Workflow:       .github/workflows/release.yml')}${' '.repeat(14)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.white('Environment:    production')}${' '.repeat(36)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.white('Publishing:     Require 2FA and disallow tokens')}${' '.repeat(8)}${chalk.cyan('│')}
${chalk.cyan('│')} ${chalk.gray('─'.repeat(63))}${chalk.cyan('│')}
${chalk.cyan('│                                                                │')}
${chalk.cyan('└────────────────────────────────────────────────────────────────┘')}
`);

  // Perform auto-actions
  console.log(chalk.blue('🚀 Performing auto-actions...'));

  const browserOpened = await openNpmAccessPage(packageName);
  await copyToClipboard(repositoryFullName, 'Repository name');
  await copyToClipboard('.github/workflows/release.yml', 'Workflow path');
  await copyToClipboard('production', 'Environment');
  await copyToClipboard('Require 2FA and disallow tokens', 'Publishing access');

  return browserOpened;
}

// Export utility functions for use in other modules
export { checkGitHubAuth, findWorkspacePackages, getRepositoryInfo };

export async function setupNpmPublishing(options = {}) {
  const spinner = ora('Checking current setup...').start();

  try {
    // Step 1: Check GitHub CLI authentication
    spinner.text = 'Checking GitHub CLI authentication...';
    const ghAuth = checkGitHubAuth();
    if (!ghAuth.authenticated) {
      spinner.fail('GitHub CLI not authenticated');
      throw new Error('Please run: gh auth login');
    }
    spinner.succeed('GitHub CLI authenticated');

    // Step 2: Get repository information
    spinner.text = 'Getting repository information...';
    const repoInfo = await getRepositoryInfo();
    if (!repoInfo) {
      spinner.fail('Could not get repository information');
      throw new Error('Not in a GitHub repository');
    }
    spinner.succeed(`Repository: ${repoInfo.name}`);

    // Step 3: Find packages in workspace
    spinner.text = 'Scanning workspace packages...';
    const packages = await findWorkspacePackages();
    spinner.succeed(`Found ${packages.length} packages`);

    // Step 4: Package filtering based on --package flag
    let targetPackages = packages;
    if (options.package) {
      const targetPkg = packages.find(
        p =>
          p.name === options.package ||
          p.name === `@dawlabs/${options.package}` ||
          p.name.endsWith(`/${options.package}`),
      );

      if (!targetPkg) {
        spinner.fail(`Package not found: ${options.package}`);
        console.log(chalk.red(`❌ Target package "${options.package}" not found`));
        console.log(chalk.yellow('💡 Available packages:'));
        packages.forEach(p => console.log(`   • ${p.name}@${p.version}`));
        throw new Error(`Package "${options.package}" not found in workspace`);
      }

      targetPackages = [targetPkg];
      spinner.succeed(`Target package found: ${targetPkg.name}@${targetPkg.version}`);
    }

    // Step 5: Interactive setup if requested
    if (options.interactive) {
      spinner.stop();
      displayCategorizedPackages(packages, options.package);

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Configure trusted publishing for all packages', value: 'configure-all' },
            {
              name: 'Configure trusted publishing for specific packages',
              value: 'configure-specific',
            },
            { name: 'Publish unpublished packages manually', value: 'publish-manual' },
            { name: 'Show current status', value: 'status' },
          ],
        },
      ]);

      await handleInteractiveAction(action, targetPackages, repoInfo);
    } else {
      // Automated setup
      await automatedSetup(targetPackages, repoInfo);
    }

    spinner.stop();
    console.log(chalk.green('\n✅ NPM publishing setup completed!\n'));
  } catch (error) {
    spinner.fail('Setup failed');
    throw error;
  }
}

function checkGitHubAuth() {
  try {
    const authStatus = execSync('gh auth status', { encoding: 'utf8' });
    return {
      authenticated: authStatus.includes('Logged in'),
      status: authStatus,
    };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

async function findWorkspacePackages() {
  try {
    // Use pnpm to list workspace packages
    const output = execSync('pnpm ls --recursive --depth=0 --json', { encoding: 'utf8' });
    const packagesData = JSON.parse(output);

    const packages = [];

    for (const pkg of packagesData) {
      if (pkg.name && !pkg.name.includes('monorepo')) {
        const packagePath = pkg.path || pkg.name;
        const packageJsonPath = join(packagePath, 'package.json');

        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(execSync(`cat ${packageJsonPath}`, { encoding: 'utf8' }));

          // Check if package is published
          const published = await checkNpmPackage(pkg.name);

          packages.push({
            name: pkg.name,
            version: pkg.version,
            path: packagePath,
            packageJson,
            published,
            private: packageJson.private || false,
          });
        }
      }
    }

    return packages.filter(pkg => !pkg.private);
  } catch {
    console.error(chalk.yellow('Warning: Could not get workspace packages from pnpm'));
    // Fallback to manual scanning
    return scanPackagesManually();
  }
}

async function scanPackagesManually() {
  const packages = [];
  const directories = ['packages/*', 'tools/*'];

  for (const dir of directories) {
    try {
      const paths = execSync(`find ${dir} -name 'package.json' -type f 2>/dev/null`, {
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .filter(Boolean);

      for (const packageJsonPath of paths) {
        try {
          const packageJson = JSON.parse(execSync(`cat ${packageJsonPath}`, { encoding: 'utf8' }));

          if (
            !packageJson.private &&
            packageJson.name &&
            packageJson.name.startsWith('@dawlabs/')
          ) {
            const published = await checkNpmPackage(packageJson.name);
            const packagePath = packageJsonPath.replace('/package.json', '');

            packages.push({
              name: packageJson.name,
              version: packageJson.version,
              path: packagePath,
              packageJson,
              published,
            });
          }
        } catch {
          // Skip invalid package.json files
        }
      }
    } catch {
      // Directory doesn't exist, continue
    }
  }

  return packages;
}

async function handleInteractiveAction(action, packages, repoInfo) {
  switch (action) {
    case 'configure-all':
      await configureTrustedPublishing(packages, repoInfo);
      break;
    case 'configure-specific':
      await configureSpecificPackages(packages, repoInfo);
      break;
    case 'publish-manual':
      await publishPackagesManually(packages);
      break;
    case 'status':
      showDetailedStatus(packages, repoInfo);
      break;
  }
}

async function configureTrustedPublishing(packages, repoInfo) {
  const spinner = ora('Configuring trusted publishing...').start();

  for (const pkg of packages) {
    if (!pkg.published) {
      spinner.text = `Configuring ${pkg.name}...`;

      // Display enhanced setup instructions with auto-actions
      spinner.stop();
      const browserOpened = await displaySetupInstructions(pkg.name, repoInfo);
      console.log(chalk.blue('\n⏳ Setup Instructions:'));
      console.log(
        `1. ${browserOpened ? '✅ Browser opened to npm access page' : '📋 Open the URL below in your browser'}`,
      );
      console.log('2. Click "Connect repository"');
      console.log('3. Paste the repository name (copied to clipboard)');
      console.log('4. Paste the workflow path (copied to clipboard)');
      console.log('5. Set Environment: production');
      console.log('6. Set Publishing Access: Require 2FA and disallow tokens');
      console.log('7. Save configuration');

      const { ready } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'ready',
          message: browserOpened
            ? '✅ Values copied to clipboard. Completed npm trusted publishing setup?'
            : '📋 Values copied to clipboard. Complete setup in browser?',
          default: false,
        },
      ]);

      if (!ready) {
        spinner.warn(`❌ ${pkg.name} setup not completed. Run again when ready.`);
        continue;
      }

      // Provide manual publish instruction for first-time setup
      console.log(chalk.cyan(`\n📤 Manual first publish required for ${pkg.name}:`));
      console.log(chalk.white(`   cd ${pkg.path}`));
      console.log(chalk.white(`   npm publish --access public --otp=YOUR_6DIGIT_CODE`));

      const { published } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'published',
          message: '✅ Completed manual first publish?',
          default: false,
        },
      ]);

      if (published) {
        spinner.succeed(`✅ ${pkg.name} OIDC setup completed successfully`);
      } else {
        spinner.warn(`⚠️  ${pkg.name} first publish pending`);
      }

      spinner.start();
    }
  }

  spinner.succeed('Trusted publishing configuration completed');
}

async function configureSpecificPackages(packages, repoInfo) {
  const { selectedPackages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedPackages',
      message: 'Select packages to configure:',
      choices: packages
        .filter(pkg => !pkg.published)
        .map(pkg => ({
          name: `${pkg.name}@${pkg.version}`,
          value: pkg,
        })),
    },
  ]);

  if (selectedPackages.length === 0) {
    console.log(chalk.yellow('No packages selected'));
    return;
  }

  await configureTrustedPublishing(selectedPackages, repoInfo);
}

async function publishPackagesManually(packages) {
  const unpublishedPackages = packages.filter(pkg => !pkg.published);

  if (unpublishedPackages.length === 0) {
    console.log(chalk.green('All packages are already published!'));
    return;
  }

  console.log(chalk.blue('\n📦 Unpublished packages:'));
  unpublishedPackages.forEach(pkg => {
    console.log(`  - ${pkg.name}@${pkg.version}`);
  });

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to publish these packages manually?',
      default: false,
    },
  ]);

  if (confirm) {
    for (const pkg of unpublishedPackages) {
      console.log(chalk.cyan(`\nPublishing ${pkg.name}...`));
      console.log(`Run: cd ${pkg.path} && npm publish --access public --otp=YOUR_6DIGIT_CODE`);
    }
  }
}

function showDetailedStatus(packages, repoInfo) {
  console.log(chalk.blue('\n📊 Detailed Status:\n'));

  console.log(chalk.bold('Repository:'));
  console.log(`  Name: ${repoInfo.name}`);
  console.log(`  Owner: ${repoInfo.owner.login}`);
  console.log(`  URL: ${repoInfo.url}`);
  console.log(`  Main Branch: ${repoInfo.defaultBranchRef.name}`);

  console.log(chalk.bold('\nPackages:'));
  packages.forEach(pkg => {
    const status = pkg.published ? '✅ Published' : '❌ Not Published';
    const configStatus = validatePackageJson(pkg.packageJson) ? '✅' : '❌';
    console.log(`  ${status} ${configStatus} ${pkg.name}@${pkg.version}`);
    console.log(`    Path: ${pkg.path}`);

    if (!validatePackageJson(pkg.packageJson)) {
      console.log(chalk.red('    ⚠️  Package configuration issues detected'));
    }
  });
}

async function automatedSetup(packages, repoInfo) {
  const spinner = ora('Running automated setup...').start();

  const unpublishedPackages = packages.filter(pkg => !pkg.published);

  if (unpublishedPackages.length === 0) {
    spinner.succeed('All packages already published');
    return;
  }

  spinner.text = 'Generating setup instructions...';

  console.log(chalk.blue('\n📋 Automated Setup Instructions:\n'));

  for (const pkg of unpublishedPackages) {
    console.log(chalk.bold(`\n${pkg.name}@${pkg.version}:`));
    console.log('1. Configure NPM Trusted Publishing:');
    console.log(`   URL: https://www.npmjs.com/package/${pkg.name}/access`);
    console.log(`   Repository: ${repoInfo.owner.login}/${repoInfo.name}`);
    console.log('   Workflow: .github/workflows/release.yml');
    console.log('   Environment: production');

    console.log('2. Manually publish the package:');
    console.log(`   cd ${pkg.path}`);
    console.log('   npm publish --access public --otp=YOUR_6DIGIT_CODE');
  }

  spinner.succeed('Setup instructions generated');
}
