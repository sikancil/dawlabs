import { execSync } from 'child_process';

export function runGhCommand(command, options = {}) {
  try {
    const result = execSync(`gh ${command}`, {
      encoding: 'utf8',
      ...options,
    });
    return result.trim();
  } catch (error) {
    throw new Error(`GitHub CLI command failed: gh ${command}\nError: ${error.message}`);
  }
}

export async function getRepositoryInfo() {
  try {
    const repoData = runGhCommand('repo view --json name,defaultBranchRef,isPrivate,owner,url', {
      silent: false,
    });
    return JSON.parse(repoData);
  } catch (error) {
    throw new Error(
      'Could not get repository information. ' +
        'Make sure you are in a GitHub repository with gh CLI installed.',
    );
  }
}

export function checkWorkflowExists(workflowPath = '.github/workflows/release.yml') {
  try {
    runGhCommand(`workflow view ${workflowPath}`);
    return true;
  } catch (error) {
    return false;
  }
}

export function getWorkflowStatus(workflowName = 'Release') {
  try {
    const statusData = runGhCommand(
      `run list --workflow="${workflowName}" --limit=1 --json status,conclusion,createdAt`,
    );
    const runs = JSON.parse(statusData);
    return runs[0] || null;
  } catch (error) {
    return null;
  }
}

export function triggerWorkflow(workflowName = 'release.yml', branch = 'main') {
  try {
    runGhCommand(`workflow run ${workflowName} --ref=${branch}`);
    return true;
  } catch (error) {
    throw new Error(`Failed to trigger workflow: ${error.message}`);
  }
}

export function getRepositoryEnvironments() {
  try {
    const envData = runGhCommand('api repos/:owner/:repo/environments');
    return JSON.parse(envData).environments || [];
  } catch (error) {
    return [];
  }
}

export function checkEnvironmentProtection(environmentName = 'production') {
  try {
    const environments = getRepositoryEnvironments();
    const env = environments.find(e => e.name === environmentName);

    return {
      exists: !!env,
      protectionRules: env?.protection_rules || [],
    };
  } catch (error) {
    return { exists: false, protectionRules: [] };
  }
}
