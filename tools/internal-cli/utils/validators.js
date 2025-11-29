import validateNpmPackageName from 'validate-npm-package-name';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join, sep } from 'path';
import { existsSync, readFileSync } from 'fs';

export function validatePackageJson(packageJson) {
  const errors = [];
  const warnings = [];

  // Check package name
  if (!packageJson.name) {
    errors.push('Package name is required');
  } else {
    const nameValidation = validateNpmPackageName(packageJson.name);
    if (!nameValidation.validForNewPackages) {
      errors.push(`Invalid package name: ${nameValidation.errors?.join(', ') || 'Unknown error'}`);
    }
  }

  // Check version
  if (!packageJson.version) {
    errors.push('Package version is required');
  } else if (!/^\d+\.\d+\.\d+/.test(packageJson.version)) {
    warnings.push('Version should follow semantic versioning (x.y.z)');
  }

  // Check description
  if (!packageJson.description) {
    warnings.push('Package description is recommended');
  }

  // Check scoped package access
  if (packageJson.name?.startsWith('@')) {
    if (!packageJson.publishConfig?.access) {
      warnings.push('Scoped packages should have publishConfig.access: "public"');
    } else if (packageJson.publishConfig.access !== 'public') {
      errors.push('publishConfig.access must be "public" for public packages');
    }
  }

  // Check main/exports field for libraries
  if (!packageJson.bin && !packageJson.main && !packageJson.exports) {
    warnings.push('Libraries should specify main, exports, or bin field');
  }

  // Check files field
  if (!packageJson.files) {
    warnings.push('files field is recommended to control what gets published');
  }

  // Check engines
  if (!packageJson.engines) {
    warnings.push('engines field is recommended to specify Node.js version');
  }

  // Check repository
  if (!packageJson.repository) {
    warnings.push('repository field is recommended');
  }

  // Check author/maintainer
  if (!packageJson.author && !packageJson.maintainer) {
    warnings.push('author or maintainer field is recommended');
  }

  // Check license
  if (!packageJson.license) {
    warnings.push('license field is recommended');
  }

  // Check keywords
  if (!packageJson.keywords || packageJson.keywords.length === 0) {
    warnings.push('keywords field helps with package discovery');
  }

  // Check scripts
  if (packageJson.bin) {
    if (!packageJson.scripts?.build && !packageJson.scripts?.prepublishOnly) {
      warnings.push('Binary packages should have a build script');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the repository root directory by navigating up from the current tool location
 */
function getRepositoryRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // Navigate up from tools/internal-cli to the repository root
  const pathParts = currentDir.split('/');

  // Navigate up until we find indicators of monorepo root
  let rootPath = currentDir;
  for (let i = 0; i < 5; i++) {
    // Go up at most 5 levels
    rootPath = pathParts.slice(0, -i).join(sep);
    if (
      existsSync(join(rootPath, '.identity.dawlabs.json')) ||
      existsSync(join(rootPath, 'pnpm-workspace.yaml'))
    ) {
      break;
    }
  }

  return rootPath;
}

export function validateWorkflowConfig(workflowPath = '.github/workflows/release.yml') {
  const repoRoot = getRepositoryRoot();
  const fullPath = join(repoRoot, workflowPath);

  if (!existsSync(fullPath)) {
    return {
      valid: false,
      errors: [`Workflow file not found: ${fullPath}`],
      warnings: [],
    };
  }

  try {
    const workflowContent = readFileSync(fullPath, 'utf8');
    const errors = [];
    const warnings = [];

    // Check for required permissions
    if (!workflowContent.includes('id-token: write')) {
      errors.push('Missing required permission: id-token: write for OIDC authentication');
    }

    if (!workflowContent.includes('contents: write')) {
      errors.push('Missing required permission: contents: write');
    }

    if (!workflowContent.includes('pull-requests: write')) {
      warnings.push('Missing recommended permission: pull-requests: write for changeset PRs');
    }

    // Check for environment
    if (!workflowContent.includes('environment:')) {
      warnings.push('Workflow should specify an environment for security');
    }

    // Check for OIDC authentication
    if (
      !workflowContent.includes('registry-url:') ||
      !workflowContent.includes('registry.npmjs.org')
    ) {
      warnings.push('Workflow should use OIDC authentication with registry-url');
    }

    // Check for changeset action
    if (!workflowContent.includes('changesets/action@v1')) {
      errors.push('Missing changeset action for automated publishing');
    }

    // Check for proper node setup
    if (!workflowContent.includes('actions/setup-node@v4')) {
      warnings.push('Should use actions/setup-node@v4 for better performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to read workflow file: ${error.message}`],
      warnings: [],
    };
  }
}

export function validateMonorepoConfig() {
  const errors = [];
  const warnings = [];

  // Check for package.json workspaces
  try {
    const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    if (!rootPackageJson.workspaces) {
      errors.push('Root package.json must define workspaces');
    } else {
      if (!Array.isArray(rootPackageJson.workspaces)) {
        errors.push('workspaces must be an array of paths');
      } else {
        const expectedWorkspaces = ['apps/*', 'packages/*', 'tools/*'];
        const hasRequired = expectedWorkspaces.some(ws => rootPackageJson.workspaces.includes(ws));
        if (!hasRequired) {
          warnings.push('Consider using standard workspace patterns: apps/*, packages/*, tools/*');
        }
      }
    }

    // Check for packageManager
    if (!rootPackageJson.packageManager) {
      warnings.push('packageManager field is recommended for consistent development');
    }

    // Check for scripts
    const requiredScripts = ['build', 'test', 'lint'];
    requiredScripts.forEach(script => {
      if (!rootPackageJson.scripts?.[script]) {
        warnings.push(`Missing recommended script: ${script}`);
      }
    });
  } catch {
    errors.push('Could not read root package.json');
  }

  // Check for turbo.json
  if (!existsSync('turbo.json')) {
    warnings.push('turbo.json is recommended for task orchestration');
  }

  // Check for pnpm-lock.yaml
  if (!existsSync('pnpm-lock.yaml')) {
    warnings.push('pnpm-lock.yaml should be committed for consistent installs');
  }

  // Check for .github/workflows directory
  if (!existsSync('.github/workflows')) {
    errors.push('.github/workflows directory is required for CI/CD');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate GitHub CLI (gh) availability and basic functionality
 */
export function validateGitHubCLI() {
  const result = {
    available: false,
    version: null,
    authenticated: false,
    errors: [],
    setupInstructions: [],
  };

  try {
    // Check if GitHub CLI is installed
    const version = execSync('gh --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    result.version = version;
    result.available = true;

    // Check authentication
    try {
      const authStatus = execSync('gh auth status', { encoding: 'utf8', stdio: 'pipe' });
      result.authenticated = authStatus.includes('Logged in');
    } catch {
      result.authenticated = false;
      result.setupInstructions.push('Run: gh auth login');
    }

    if (!result.authenticated) {
      result.errors.push('GitHub CLI is not authenticated');
    }
  } catch {
    result.errors.push('GitHub CLI is not installed');
    result.setupInstructions.push(
      'macOS: brew install gh',
      'Windows: scoop install gh or winget install GitHub.cli',
      'Linux: See https://github.com/cli/cli#installation',
      'Or download from: https://github.com/cli/cli/releases',
    );
  }

  return result;
}

/**
 * Validate pnpm availability and version compatibility
 */
export function validatePnpm() {
  const result = {
    available: false,
    version: null,
    supportedVersion: true,
    errors: [],
    setupInstructions: [],
  };

  try {
    const version = execSync('pnpm --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    result.version = version;
    result.available = true;

    // Basic version check - pnpm should be at least version 7
    const versionNum = parseInt(version.split('.')[0]);
    if (versionNum < 7) {
      result.supportedVersion = false;
      result.errors.push(`pnpm version ${version} is not supported. Requires v7.0.0 or higher`);
      result.setupInstructions.push('Upgrade: npm install -g pnpm@latest');
    }
  } catch {
    result.errors.push('pnpm is not installed');
    result.setupInstructions.push('npm install -g pnpm', 'Or visit: https://pnpm.io/installation');
  }

  return result;
}

/**
 * Validate git availability and basic configuration
 */
export function validateGit() {
  const result = {
    available: false,
    version: null,
    configured: false,
    errors: [],
    setupInstructions: [],
  };

  try {
    // Check if git is installed
    const version = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    result.version = version;
    result.available = true;

    // Check if in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });

      // Check git configuration
      try {
        const userName = execSync('git config user.name', {
          encoding: 'utf8',
          stdio: 'pipe',
        }).trim();
        const userEmail = execSync('git config user.email', {
          encoding: 'utf8',
          stdio: 'pipe',
        }).trim();

        if (userName && userEmail) {
          result.configured = true;
        } else {
          result.errors.push('Git is not configured with user name and email');
          result.setupInstructions.push(
            'git config --global user.name "Your Name"',
            'git config --global user.email "your.email@example.com"',
          );
        }
      } catch {
        result.errors.push('Git configuration is incomplete');
        result.setupInstructions.push(
          'git config --global user.name "Your Name"',
          'git config --global user.email "your.email@example.com"',
        );
      }
    } catch {
      result.errors.push('Not in a git repository');
      result.setupInstructions.push('Initialize: git init');
    }
  } catch {
    result.errors.push('git is not installed');
    result.setupInstructions.push(
      'macOS: brew install git',
      'Windows: Download from https://git-scm.com/download/win',
      'Linux: sudo apt-get install git (Ubuntu/Debian)',
      'Or visit: https://git-scm.com/downloads',
    );
  }

  return result;
}

/**
 * Validate all required system dependencies for deployment setup
 */
export function validateSystemDependencies() {
  const spinner = ora('Validating system dependencies...').start();

  const results = {
    github: validateGitHubCLI(),
    pnpm: validatePnpm(),
    git: validateGit(),
  };

  const allValid =
    results.github.available &&
    results.pnpm.available &&
    results.pnpm.supportedVersion &&
    results.git.available &&
    results.git.configured;

  if (allValid) {
    spinner.succeed('System dependencies validated');
  } else {
    spinner.fail('System dependency validation failed');
  }

  return {
    valid: allValid,
    results,
    summary: {
      github: results.github.available && results.github.authenticated,
      pnpm: results.pnpm.available && results.pnpm.supportedVersion,
      git: results.git.available && results.git.configured,
    },
  };
}

/**
 * Display validation results with helpful setup instructions
 */
export function displayValidationResults(validation) {
  console.log(chalk.blue.bold('\n🔧 System Dependency Validation:\n'));

  // GitHub CLI
  if (validation.results.github.available) {
    if (validation.results.github.authenticated) {
      console.log(chalk.green('✅ GitHub CLI (gh): Available and authenticated'));
    } else {
      console.log(chalk.yellow('⚠️  GitHub CLI (gh): Available but not authenticated'));
      console.log(chalk.red('   Issue: Not logged in to GitHub'));
      validation.results.github.setupInstructions.forEach(instruction => {
        console.log(chalk.cyan(`   Fix: ${instruction}`));
      });
    }
  } else {
    console.log(chalk.red('❌ GitHub CLI (gh): Not available'));
    validation.results.github.errors.forEach(error => {
      console.log(chalk.red(`   Issue: ${error}`));
    });
    validation.results.github.setupInstructions.forEach(instruction => {
      console.log(chalk.cyan(`   Fix: ${instruction}`));
    });
  }

  // pnpm
  if (validation.results.pnpm.available) {
    if (validation.results.pnpm.supportedVersion) {
      console.log(chalk.green(`✅ pnpm: Available (${validation.results.pnpm.version})`));
    } else {
      console.log(
        chalk.yellow(
          `⚠️  pnpm: Available but unsupported version (${validation.results.pnpm.version})`,
        ),
      );
      validation.results.pnpm.errors.forEach(error => {
        console.log(chalk.red(`   Issue: ${error}`));
      });
      validation.results.pnpm.setupInstructions.forEach(instruction => {
        console.log(chalk.cyan(`   Fix: ${instruction}`));
      });
    }
  } else {
    console.log(chalk.red('❌ pnpm: Not available'));
    validation.results.pnpm.errors.forEach(error => {
      console.log(chalk.red(`   Issue: ${error}`));
    });
    validation.results.pnpm.setupInstructions.forEach(instruction => {
      console.log(chalk.cyan(`   Fix: ${instruction}`));
    });
  }

  // git
  if (validation.results.git.available) {
    if (validation.results.git.configured) {
      console.log(
        chalk.green(`✅ git: Available and configured (${validation.results.git.version})`),
      );
    } else {
      console.log(
        chalk.yellow(`⚠️  git: Available but not configured (${validation.results.git.version})`),
      );
      validation.results.git.errors.forEach(error => {
        console.log(chalk.red(`   Issue: ${error}`));
      });
      validation.results.git.setupInstructions.forEach(instruction => {
        console.log(chalk.cyan(`   Fix: ${instruction}`));
      });
    }
  } else {
    console.log(chalk.red('❌ git: Not available'));
    validation.results.git.errors.forEach(error => {
      console.log(chalk.red(`   Issue: ${error}`));
    });
    validation.results.git.setupInstructions.forEach(instruction => {
      console.log(chalk.cyan(`   Fix: ${instruction}`));
    });
  }

  console.log('');
}
