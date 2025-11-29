#!/usr/bin/env node

// Debug test to isolate the hanging issue
import ora from 'ora';
import chalk from 'chalk';

async function debugTest() {
  console.log(chalk.blue('🔍 Debug Test Started'));

  try {
    const spinner = ora('Testing spinner').start();
    await new Promise(resolve => setTimeout(resolve, 500));
    spinner.succeed('Spinner works');

    spinner.text = 'Testing GitHub auth check...';
    const { checkGitHubAuth } = await import('./commands/npm-publishing.js');
    const ghAuth = checkGitHubAuth();
    if (!ghAuth.authenticated) {
      throw new Error('Not authenticated');
    }
    spinner.succeed('GitHub auth works');

    spinner.text = 'Testing repo info...';
    const { getRepositoryInfo } = await import('./commands/npm-publishing.js');
    const repoInfo = await getRepositoryInfo();
    if (!repoInfo) {
      throw new Error('No repo info');
    }
    spinner.succeed(`Repo: ${repoInfo.name}`);

    spinner.text = 'Testing package analysis...';
    const { getSmartPackageAnalysis } = await import('./commands/npm-publishing.js');
    const analysis = await getSmartPackageAnalysis();
    spinner.succeed(`Analysis complete: ${analysis.packages.length} packages`);

    spinner.stop();

    console.log(chalk.green('✅ All tests passed!'));

    // Test interactive mode logic
    const setupOptions = { noInteractive: false };
    const interactive = setupOptions.noInteractive !== true;
    console.log(`Interactive mode: ${interactive}`);

    if (interactive) {
      console.log(chalk.yellow('🔄 Would show interactive prompts here...'));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

debugTest().catch(error => {
  console.error('Debug test failed:', error.message);
  process.exit(1);
});
