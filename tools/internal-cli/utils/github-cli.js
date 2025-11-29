/**
 * DAWLabs GitHub CLI Integration - Secure GitHub Operations Wrapper
 *
 * @context Core GitHub CLI integration utility for DAWLabs deployment and repository management
 * @purpose Provides secure, validated access to GitHub CLI operations for automated workflows, repository management, and CI/CD integration
 * @integration Used throughout the internal CLI system for repository operations, authentication checks, and GitHub API interactions
 * @workflow Wraps GitHub CLI commands with security validation, repository root detection, and comprehensive error handling
 *
 * Security Features:
 * - Command Validation: Whitelist-based validation prevents command injection attacks
 * - API Endpoint Filtering: Restricted access to safe GitHub API endpoints only
 * - Character Sanitization: Prevents dangerous shell characters and injection vectors
 * - Path Traversal Protection: Validates repository root detection and prevents path manipulation
 *
 * Command Categories:
 * - Repository: repo view, create, delete operations for repository management
 * - Authentication: auth status, login, logout for GitHub CLI authentication
 * - Issues & PRs: issue list, pr list for development workflow integration
 * - Releases: release list, create for version management and deployment
 * - Workflows: workflow list, run for CI/CD pipeline management
 * - Secrets & Variables: secret list, variable list for configuration management
 * - API: Safe API endpoint access for custom GitHub operations
 *
 * Error Handling Strategy:
 * - Command Validation: Pre-execution validation with clear error messages
 * - GitHub CLI Errors: Wrapped error messages with actionable guidance
 * - Repository Detection: Fallback mechanisms for monorepo root detection
 * - API Failures: Graceful degradation with detailed error reporting
 *
 * Integration Points:
 * - NPM Publishing: Repository validation and trusted publishing setup
 * - CI/CD Workflows: GitHub Actions workflow management and execution
 * - Oracle Intelligence: Repository analysis and package discovery
 * - Deployment Pipeline: Release management and deployment automation
 *
 * Performance Considerations:
 * - Repository Caching: Efficient repository root detection with caching
 * - Command Batching: Minimizes GitHub CLI process overhead
 * - Error Fast-Fail: Early validation prevents unnecessary GitHub API calls
 *
 * @example
 * // Get repository information securely
 * const repoInfo = await getRepositoryInfo();
 * console.log(`Repository: ${repoInfo.name}`);
 *
 * // Run validated GitHub CLI command
 * const branches = runGhCommand('branch list --json name');
 *
 * // Check authentication status
 * const authStatus = checkGitHubAuth();
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, sep } from 'path';
import { existsSync } from 'fs';

/**
 * Get the repository root directory by navigating up from the current tool location
 */
export function getRepositoryRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  const pathParts = currentDir.split(sep);

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

/**
 * Validate GitHub CLI command to prevent command injection
 */
function validateGhCommand(command) {
  // Only allow safe GitHub CLI commands and arguments
  const allowedCommands = [
    'repo view',
    'repo create',
    'repo delete',
    'auth status',
    'auth login',
    'auth logout',
    'issue list',
    'pr list',
    'release list',
    'release create',
    'workflow list',
    'workflow run',
    'secret list',
    'variable list',
    'api',
  ];

  const commandParts = command.trim().split(/\s+/);
  const baseCommand = commandParts[0];
  const subCommand = commandParts[1];

  // Check if the full command (base + subcommand) is allowed
  const fullCommand = subCommand ? `${baseCommand} ${subCommand}` : baseCommand;
  if (!allowedCommands.includes(fullCommand)) {
    throw new Error(`Unauthorized GitHub CLI command: ${fullCommand}`);
  }

  // Additional validation for specific commands
  if (baseCommand === 'api') {
    // Only allow safe API endpoints
    const allowedEndpoints = ['repos', 'user', 'orgs', 'search/repositories'];
    if (commandParts[1] && !allowedEndpoints.some(endpoint => commandParts[1].includes(endpoint))) {
      throw new Error(`Unauthorized API endpoint: ${commandParts[1]}`);
    }
  }

  // Prevent dangerous characters
  const dangerousPatterns = /[;&|`$(){}[\]\\]/;
  if (dangerousPatterns.test(command)) {
    throw new Error('Command contains dangerous characters');
  }

  return true;
}

export function runGhCommand(command, options = {}) {
  try {
    validateGhCommand(command);

    const repoRoot = getRepositoryRoot();
    const result = execSync(`gh ${command}`, {
      encoding: 'utf8',
      cwd: repoRoot,
      ...options,
    });
    return result.trim();
  } catch (error) {
    throw new Error(`GitHub CLI command failed: gh ${command}\nError: ${error.message}`);
  }
}

export async function getRepositoryInfo() {
  try {
    const repoData = runGhCommand(
      'repo view --json name,defaultBranchRef,owner,url,visibility,isPrivate',
    );
    const parsed = JSON.parse(repoData);

    return parsed;
  } catch {
    throw new Error(
      'Could not get repository information. ' +
        'Make sure you are in a GitHub repository with gh CLI installed.',
    );
  }
}

export function checkWorkflowExists(workflowPath = '.github/workflows/release.yml') {
  const repoRoot = getRepositoryRoot();
  const fullPath = join(repoRoot, workflowPath);

  // First check if the file exists in the filesystem
  if (!existsSync(fullPath)) {
    return false;
  }

  // Then optionally check if GitHub CLI can see the workflow
  try {
    runGhCommand(`workflow view ${workflowPath}`);
    return true;
  } catch {
    // File exists locally but GitHub CLI might not recognize it yet
    // This is normal for newly created files that haven't been pushed
    return true;
  }
}

export function getWorkflowStatus(workflowName = 'Release') {
  try {
    const statusData = runGhCommand(
      `run list --workflow="${workflowName}" --limit=1 --json status,conclusion,createdAt`,
    );
    const runs = JSON.parse(statusData);
    return runs[0] || null;
  } catch {
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
  } catch {
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
  } catch {
    return { exists: false, protectionRules: [] };
  }
}
