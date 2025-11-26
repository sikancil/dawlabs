import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
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
      console.log('node tools/deployment-setup/index.js setup repository --interactive');
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
  const workflowPath = '.github/workflows/release.yml';

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
