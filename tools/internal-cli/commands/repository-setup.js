import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

import { runGhCommand, getRepositoryEnvironments } from '../utils/github-cli.js';

export async function setupRepositoryConfig(options = {}) {
  const { repoInfo } = options;

  if (!repoInfo) {
    throw new Error('Repository information required for setup');
  }

  const spinner = ora('Setting up repository configuration...').start();

  try {
    // Step 1: Check if environments exist
    spinner.text = 'Checking repository environments...';
    const environments = getRepositoryEnvironments();
    const productionEnv = environments.find(env => env.name === 'production');

    if (!productionEnv) {
      spinner.succeed('Production environment needs to be created');
      spinner.stop();

      console.log(chalk.blue('\n🏗️  Create Production Environment:'));
      console.log(
        '1. Go to: https://github.com/' +
          repoInfo.owner.login +
          '/' +
          repoInfo.name +
          '/settings/environments/new',
      );
      console.log('2. Name: production');
      console.log('3. Environment protection rules (recommended):');
      console.log('   - Wait timer: 0 minutes');
      console.log('   - Reviewers: None (for automated publishing)');
      console.log('   - Deployment branch restrictions: main branch');

      const { environmentReady } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'environmentReady',
          message: 'Have you created the production environment?',
          default: false,
        },
      ]);

      if (!environmentReady) {
        throw new Error('Production environment is required for trusted publishing');
      }
    } else {
      spinner.succeed('Production environment found');
    }

    // Step 2: Check branch protection rules
    spinner.text = 'Checking branch protection...';
    await checkBranchProtection(repoInfo);

    // Step 3: Verify GitHub Actions permissions
    spinner.text = 'Verifying GitHub Actions permissions...';
    await verifyActionsPermissions();

    spinner.stop();
    console.log(chalk.green('\n✅ Repository configuration completed!\n'));
  } catch (error) {
    spinner.fail('Repository setup failed');
    throw error;
  }
}

async function checkBranchProtection(repoInfo) {
  try {
    // Check if branch protection exists for main branch
    const branchData = runGhCommand('api repos/:owner/:repo/branches/main/protection');

    if (branchData) {
      console.log(chalk.green('✅ Branch protection rules are configured for main branch'));
    } else {
      console.log(chalk.yellow('\n⚠️  Branch protection not configured for main branch'));
      console.log('Consider setting up branch protection for better security:');
      console.log(
        '1. Go to: https://github.com/' +
          repoInfo.owner.login +
          '/' +
          repoInfo.name +
          '/settings/branches',
      );
      console.log('2. Add rule for main branch');
      console.log('3. Require pull request reviews before merging');
      console.log('4. Require status checks to pass before merging');
      console.log('   - Check: Build');
      console.log('   - Check: Test');
      console.log('   - Check: Lint');
    }
  } catch (_error) {
    console.log(chalk.yellow('\n⚠️  Could not check branch protection rules'));
    console.log('This is optional but recommended for better security');
  }
}

async function verifyActionsPermissions() {
  try {
    // Get workflow runs to check permissions
    const runs = runGhCommand('run list --limit=1 --json status,conclusion,headBranch');
    const runData = JSON.parse(runs);

    if (runData.length > 0) {
      console.log(chalk.green('✅ GitHub Actions have been run recently'));
    } else {
      console.log(chalk.yellow('\n⚠️  No recent GitHub Actions runs found'));
      console.log('Trigger a test workflow to verify permissions:');
      console.log('gh workflow run release.yml');
    }
  } catch (_error) {
    console.log(chalk.yellow('\n⚠️  Could not verify GitHub Actions permissions'));
    console.log('Make sure the workflow file has the correct permissions:');
    console.log('- contents: write');
    console.log('- pull-requests: write');
    console.log('- id-token: write (for OIDC authentication)');
  }
}

function createGitHubActionsTemplate() {
  return `name: Release

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  id-token: write # REQUIRED for OIDC authentication

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    environment: production # Matches npm trusted publishing setting
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org" # OIDC authentication

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.0.0

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          STORE_PATH=$(pnpm store path --silent)
          echo "STORE_PATH=$STORE_PATH" >> $GITHUB_ENV
          echo "path=$STORE_PATH" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: \${{ steps.pnpm-cache.outputs.path }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Build All Packages
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          # This expects you to have a script called version which does a release build
          version: pnpm version-packages
          # This will run the build script if a release PR is merged,
          # or if there are changesets left to publish
          publish: pnpm release
          commit: "chore: version packages"
          title: "chore: version packages"
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          # No NPM_TOKEN or NODE_AUTH_TOKEN needed - OIDC handles authentication
`;
}

function showGitHubActionsTemplate() {
  const workflowTemplate = createGitHubActionsTemplate();
  console.log(chalk.blue('\n📝 GitHub Actions Template:'));
  console.log('Save the following as .github/workflows/release.yml:\n');
  console.log(workflowTemplate);
}

export { createGitHubActionsTemplate, showGitHubActionsTemplate };
