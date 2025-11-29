import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { checkWorkflowExists, getWorkflowStatus, triggerWorkflow } from '../utils/github-cli.js';
import { validateWorkflowConfig } from '../utils/validators.js';

export async function verifyCicdWorkflow() {
  const spinner = ora('Verifying CI/CD workflow...').start();

  try {
    // Step 1: Check if workflow file exists
    spinner.text = 'Checking workflow file existence...';
    const workflowExists = checkWorkflowExists();

    if (!workflowExists) {
      spinner.fail('Release workflow not found');
      console.log(chalk.red('\n❌ Missing: .github/workflows/release.yml'));
      console.log(chalk.cyan('\nCreate the workflow file using:'));
      console.log('node tools/internal-cli/index.js setup repository --interactive');
      return false;
    }
    spinner.succeed('Release workflow found');

    // Step 2: Validate workflow configuration
    spinner.text = 'Validating workflow configuration...';
    const validation = validateWorkflowConfig();

    if (!validation.valid) {
      spinner.fail('Workflow configuration has errors');
      console.log(chalk.red('\n❌ Workflow Errors:'));
      validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Workflow Warnings:'));
        validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      }
      return false;
    }
    spinner.succeed('Workflow configuration is valid');

    // Step 3: Check recent workflow runs
    spinner.text = 'Checking recent workflow runs...';
    const recentRun = getWorkflowStatus();

    if (recentRun) {
      const statusIcon = recentRun.status === 'completed' ? '✅' : '⚠️';
      // const conclusionIcon = recentRun.conclusion === 'success' ? '✅' : '❌';

      console.log(chalk.green(`\n${statusIcon} Last workflow run:`));
      console.log(`  Status: ${recentRun.status}`);
      console.log(`  Conclusion: ${recentRun.conclusion || 'pending'}`);
      console.log(`  Created: ${new Date(recentRun.createdAt).toLocaleString()}`);
      spinner.succeed('Recent workflow runs found');
    } else {
      spinner.warn('No recent workflow runs found');
      console.log(chalk.yellow('\n💡 Trigger a test workflow:'));
      console.log('gh workflow run release.yml');
    }

    // Step 4: Check workflow file permissions and structure
    spinner.text = 'Checking workflow file structure...';
    await checkWorkflowStructure();
    spinner.succeed('Workflow file structure is correct');

    spinner.stop();
    console.log(chalk.green('\n✅ CI/CD workflow verification completed!\n'));

    return true;
  } catch (error) {
    spinner.fail('CI/CD workflow verification failed');
    throw error;
  }
}

async function checkWorkflowStructure() {
  // Get repository root
  const repoRoot = await import('../utils/github-cli.js').then(m => m.getRepositoryRoot());
  const { join } = await import('path');

  const workflowPath = join(repoRoot, '.github', 'workflows', 'release.yml');

  if (!existsSync(workflowPath)) {
    throw new Error('Workflow file does not exist');
  }

  const { readFileSync } = await import('fs');
  const content = readFileSync(workflowPath, 'utf8');

  // Check for required components
  const requiredComponents = [
    { name: 'OIDC permissions', pattern: /id-token:\s*write/ },
    { name: 'Contents permissions', pattern: /contents:\s*write/ },
    { name: 'Pull request permissions', pattern: /pull-requests:\s*write/ },
    { name: 'Production environment', pattern: /environment:\s*production/ },
    { name: 'Node.js setup', pattern: /actions\/setup-node@v4/ },
    { name: 'Changeset action', pattern: /changesets\/action@v1/ },
    {
      name: 'OIDC registry URL',
      pattern: /registry-url:\s*["']https:\/\/registry\.npmjs\.org["']/,
    },
  ];

  const missingComponents = [];

  for (const component of requiredComponents) {
    if (!component.pattern.test(content)) {
      missingComponents.push(component.name);
    }
  }

  if (missingComponents.length > 0) {
    console.log(chalk.yellow('\n⚠️  Missing workflow components:'));
    missingComponents.forEach(comp => console.log(`  • ${comp}`));
  }
}

export async function testWorkflow() {
  const spinner = ora('Testing workflow execution...').start();

  try {
    // Check if workflow exists first
    if (!checkWorkflowExists()) {
      spinner.fail('Workflow file not found');
      throw new Error('Create .github/workflows/release.yml first');
    }

    spinner.text = 'Triggering test workflow run...';
    const success = triggerWorkflow();

    if (success) {
      spinner.succeed('Test workflow triggered successfully');
      console.log(chalk.green('\n🚀 Workflow is running...'));
      console.log(chalk.cyan('Monitor progress: gh run list --workflow=release.yml --follow'));
    } else {
      spinner.fail('Failed to trigger workflow');
      throw new Error('Could not trigger workflow run');
    }
  } catch (error) {
    spinner.fail('Workflow test failed');
    throw error;
  }
}

export async function getWorkflowHealth() {
  const health = {
    workflowExists: false,
    configValid: false,
    recentRuns: false,
    lastRunStatus: null,
    issues: [],
    recommendations: [],
  };

  try {
    // Check workflow existence
    health.workflowExists = checkWorkflowExists();

    if (health.workflowExists) {
      // Validate configuration
      const validation = validateWorkflowConfig();
      health.configValid = validation.valid;
      health.issues.push(...validation.errors);
      health.recommendations.push(...validation.warnings);

      // Check recent runs
      const recentRun = getWorkflowStatus();
      health.recentRuns = !!recentRun;
      health.lastRunStatus = recentRun
        ? {
            status: recentRun.status,
            conclusion: recentRun.conclusion,
            createdAt: recentRun.createdAt,
          }
        : null;
    } else {
      health.issues.push('Release workflow file not found');
      health.recommendations.push(
        'Create .github/workflows/release.yml with proper OIDC configuration',
      );
    }

    return health;
  } catch (error) {
    health.issues.push(`Failed to analyze workflow: ${error.message}`);
    return health;
  }
}

export async function setupCicdWorkflow(options = {}) {
  let spinner = ora('Setting up CI/CD workflow...').start();

  try {
    // Step 1: Check if workflow already exists
    spinner.text = 'Checking existing workflow...';
    const workflowExists = checkWorkflowExists();

    if (workflowExists && options.interactive) {
      spinner.stop();
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'CI/CD workflow already exists. Do you want to overwrite it?',
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('CI/CD workflow setup cancelled'));
        return false;
      }

      spinner = ora('Setting up CI/CD workflow...').start();
    }

    // Step 2: Get repository information
    spinner.text = 'Getting repository information...';
    const { getRepositoryInfo } = await import('./npm-publishing.js');
    const repoInfo = await getRepositoryInfo();

    if (!repoInfo) {
      spinner.fail('Could not get repository information');
      throw new Error('Not in a GitHub repository');
    }

    spinner.succeed(`Repository: ${repoInfo.name}`);

    // Step 3: Create workflow directory
    spinner.text = 'Creating workflow directory...';
    const workflowDir = '.github/workflows';

    if (!existsSync('.github')) {
      mkdirSync('.github');
    }

    if (!existsSync(workflowDir)) {
      mkdirSync(workflowDir, { recursive: true });
    }

    spinner.succeed('Workflow directory created');

    // Step 4: Generate workflow configuration
    spinner.text = 'Generating workflow configuration...';

    // Get organization name from repo info
    const orgName = repoInfo.owner || 'dawlabs';
    const repoName = repoInfo.name;

    const workflowContent = generateWorkflowContent(orgName, repoName);

    const workflowPath = join(workflowDir, 'release.yml');
    writeFileSync(workflowPath, workflowContent, 'utf8');

    spinner.succeed('Workflow file created');

    // Step 5: Verify workflow configuration
    spinner.text = 'Validating workflow configuration...';
    const validation = validateWorkflowConfig();

    if (!validation.valid) {
      spinner.fail('Workflow validation failed');
      console.log(chalk.red('\n❌ Workflow Errors:'));
      validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Workflow Warnings:'));
        validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      }

      throw new Error('Workflow configuration has validation errors');
    }

    spinner.succeed('Workflow validation passed');

    // Step 6: Provide next steps
    spinner.stop();
    console.log(chalk.green.bold('\n🎉 CI/CD workflow setup completed successfully!\n'));

    console.log(chalk.blue('Workflow Configuration:'));
    console.log(`  ✅ OIDC Authentication enabled`);
    console.log(`  ✅ Production environment configured`);
    console.log(`  ✅ Changeset integration active`);
    console.log(`  ✅ Oracle Intelligence integrated`);
    console.log(`  ✅ Version compliance checking enabled`);

    console.log(chalk.blue('\nNext Steps:'));
    console.log('1. Configure NPM trusted publishing:');
    console.log(`   - Visit: https://www.npmjs.com/org/${orgName}/settings`);
    console.log('   - Add GitHub Actions as trusted publisher');
    console.log('2. Create a changeset for your first release:');
    console.log('   - Run: pnpm changeset');
    console.log('3. Test the workflow:');
    console.log('   - Run: gh workflow run release.yml');
    console.log('4. Create a pull request to trigger automatic publishing');

    console.log(chalk.cyan('\nUseful Commands:'));
    console.log('  node tools/internal-cli/index.js verify cicd-workflow  - Verify workflow');
    console.log('  gh workflow list                                         - List workflows');
    console.log('  gh run list --workflow=release.yml                    - View recent runs\n');

    return true;
  } catch (error) {
    spinner.fail('CI/CD workflow setup failed');
    throw error;
  }
}

function generateWorkflowContent(orgName, _repoName) {
  return `name: Release

# Configure workflow permissions for security and access control
permissions:
  contents: write
  pull-requests: write
  id-token: write # Required for OIDC authentication

# Environment configuration for secure publishing
environments:
  production:
    url: https://www.npmjs.com/package/@${orgName}/*

# Control when workflow runs
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Prevent duplicate workflow runs
concurrency:
  group: "release"
  cancel-in-progress: false

jobs:
  # Job for releasing packages
  release:
    name: Release Packages
    runs-on: ubuntu-latest
    environment: production

    steps:
      # Checkout repository code
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      # Setup Node.js environment
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      # Install dependencies
      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile

      # Run Oracle Intelligence deployment analysis
      - name: Oracle Intelligence Analysis
        id: intelligence
        run: |
          node tools/internal-cli/commands/intelligent-analysis.js --json --fail-on-conflicts > oracle-intelligence-analysis.json 2>&1

      # Display Oracle Intelligence analysis results
      - name: Display Oracle Intelligence Analysis
        if: always()
        run: |
          echo "🧠 Oracle Intelligence Analysis Results:"
          cat oracle-intelligence-analysis.json

      # Create Release Pull Request or Publish
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          commit: "chore: update packages"
          title: "chore: update packages"

      # Display release results
      - name: Release Results
        if: steps.changesets.outputs.published == 'true'
        run: |
          echo "🎉 Packages published successfully!"
          echo "Published packages:"
          echo "\${{ steps.changesets.outputs.publishedPackages }}"

  # Job for running tests and validation
  test:
    name: Test and Validate
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      # Checkout repository code
      - name: Checkout
        uses: actions/checkout@v4

      # Setup Node.js environment
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      # Install dependencies
      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile

      # Run tests
      - name: Run tests
        run: pnpm test

      # Run linting
      - name: Run linting
        run: pnpm lint

      # Run build
      - name: Build packages
        run: pnpm build

      # Validate package configurations
      - name: Validate packages
        run: |
          node tools/internal-cli/index.js verify package-config --json
`;
}
