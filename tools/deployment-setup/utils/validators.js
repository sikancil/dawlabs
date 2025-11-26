import validateNpmPackageName from 'validate-npm-package-name';

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

import { existsSync, readFileSync } from 'fs';

export function validateWorkflowConfig(workflowPath = '.github/workflows/release.yml') {
  if (!existsSync(workflowPath)) {
    return {
      valid: false,
      errors: [`Workflow file not found: ${workflowPath}`],
      warnings: [],
    };
  }

  try {
    const workflowContent = readFileSync(workflowPath, 'utf8');
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
