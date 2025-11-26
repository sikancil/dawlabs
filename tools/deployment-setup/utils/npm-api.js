import { execSync } from 'child_process';
import { existsSync } from 'fs';

export function checkNpmPackage(packageName) {
  try {
    execSync(`npm view ${packageName} --json`, {
      encoding: 'utf8',
      stdio: 'pipe', // Suppress stderr
    });
    return true;
  } catch {
    return false;
  }
}

export async function getNpmPackageInfo(packageName) {
  try {
    const result = execSync(`npm view ${packageName} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

export function checkPackageConfig(packagePath) {
  const packageJsonPath = `${packagePath}/package.json`;

  if (!existsSync(packageJsonPath)) {
    return {
      valid: false,
      errors: ['package.json not found'],
    };
  }

  try {
    const packageJson = JSON.parse(execSync(`cat ${packageJsonPath}`, { encoding: 'utf8' }));

    const errors = [];
    const warnings = [];

    // Required fields for publishing
    if (!packageJson.name) {
      errors.push('Missing required field: name');
    }

    if (!packageJson.version) {
      errors.push('Missing required field: version');
    }

    if (!packageJson.description) {
      warnings.push('Missing recommended field: description');
    }

    // Check publishConfig for scoped packages
    if (packageJson.name?.startsWith('@') && !packageJson.publishConfig?.access) {
      warnings.push('Scoped packages should have publishConfig.access: "public"');
    }

    // Check for proper scripts if it's a tool
    if (packageJson.bin) {
      if (!packageJson.scripts?.build) {
        warnings.push('Binary packages should have a build script');
      }
    }

    // Check TypeScript configuration
    if (existsSync(`${packagePath}/tsconfig.json`) && !packageJson.types && !packageJson.typings) {
      warnings.push('TypeScript packages should specify "types" or "typings" field');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      packageJson,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid package.json: ' + error.message],
    };
  }
}

export function getWorkspacePackages() {
  try {
    // Try pnpm first
    const output = execSync('pnpm ls --recursive --depth=0 --json 2>/dev/null', {
      encoding: 'utf8',
    });
    return JSON.parse(output);
  } catch {
    try {
      // Fallback to npm workspaces
      const output = execSync('npm ls --workspaces --depth=0 --json 2>/dev/null', {
        encoding: 'utf8',
      });
      return JSON.parse(output);
    } catch {
      throw new Error(
        'Could not get workspace packages. Make sure pnpm or npm workspaces are configured.',
      );
    }
  }
}
