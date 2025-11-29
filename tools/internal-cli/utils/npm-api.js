import { execSync } from 'child_process';
import { existsSync } from 'fs';

export function checkNpmPackage(packageName, expectedVersion = null) {
  try {
    const result = execSync(`npm view ${packageName} --json`, {
      encoding: 'utf8',
      stdio: 'pipe', // Suppress stderr
    });

    if (expectedVersion) {
      const packageInfo = JSON.parse(result);
      return packageInfo.version === expectedVersion;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Enhanced package state analysis with intelligent conflict detection
 */
export async function analyzePackageState(packageName, localVersion) {
  try {
    const result = execSync(`npm view ${packageName} --json`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const packageInfo = JSON.parse(result);
    const publishedVersions = Object.keys(packageInfo.versions || {});
    const latestPublished = packageInfo.version;

    return {
      packageName,
      localVersion,
      publishedVersions,
      latestPublished,
      exists: true,
      status: determinePackageStatus(localVersion, publishedVersions, latestPublished),
      conflicts: detectVersionConflicts(localVersion, publishedVersions),
      recommendations: generateVersionRecommendations(
        localVersion,
        publishedVersions,
        latestPublished,
      ),
    };
  } catch (_error) {
    // Package doesn't exist on npm
    return {
      packageName,
      localVersion,
      publishedVersions: [],
      latestPublished: null,
      exists: false,
      status: 'new-package',
      conflicts: [],
      recommendations: {
        action: 'safe-to-publish',
        message: `Package ${packageName} is new and safe to publish`,
        suggestedVersion: localVersion,
      },
    };
  }
}

/**
 * Determine the publishing status of a package
 */
function determinePackageStatus(localVersion, publishedVersions, latestPublished) {
  if (publishedVersions.length === 0) {
    return 'new-package';
  }

  if (publishedVersions.includes(localVersion)) {
    return 'version-exists';
  }

  const localSemver = parseSemVer(localVersion);
  const latestSemver = parseSemVer(latestPublished);

  if (compareSemVer(localSemver, latestSemver) > 0) {
    return 'version-bump';
  }

  if (compareSemVer(localSemver, latestSemver) < 0) {
    return 'version-downgrade';
  }

  return 'version-equal';
}

/**
 * Detect version conflicts
 */
function detectVersionConflicts(localVersion, publishedVersions) {
  const conflicts = [];

  if (publishedVersions.includes(localVersion)) {
    conflicts.push({
      type: 'version-exists',
      severity: 'high',
      message: `Version ${localVersion} already exists on npm`,
      currentVersion: localVersion,
    });
  }

  const localSemver = parseSemVer(localVersion);
  const maxPublished = Math.max(
    ...publishedVersions.map(v => {
      const semver = parseSemVer(v);
      return semver.major * 10000 + semver.minor * 100 + semver.patch;
    }),
  );

  const maxPublishedSemver = {
    major: Math.floor(maxPublished / 10000),
    minor: Math.floor((maxPublished % 10000) / 100),
    patch: maxPublished % 100,
  };

  if (compareSemVer(localSemver, maxPublishedSemver) < 0) {
    conflicts.push({
      type: 'version-downgrade',
      severity: 'medium',
      message: `Local version ${localVersion} is lower than latest published ${formatSemVer(maxPublishedSemver)}`,
      currentVersion: localVersion,
      latestVersion: formatSemVer(maxPublishedSemver),
    });
  }

  return conflicts;
}

/**
 * Generate intelligent version recommendations
 */
function generateVersionRecommendations(localVersion, publishedVersions, latestPublished) {
  if (publishedVersions.includes(localVersion)) {
    const suggestedVersion = suggestNextVersion(latestPublished);
    return {
      action: 'version-bump',
      message: `Version ${localVersion} already published. Recommended to bump to ${suggestedVersion}`,
      suggestedVersion,
      autoResolvable: true,
      reason: 'version-exists',
    };
  }

  const localSemver = parseSemVer(localVersion);
  const latestSemver = parseSemVer(latestPublished);

  if (compareSemVer(localSemver, latestSemver) < 0) {
    return {
      action: 'manual-resolution',
      message: `Local version ${localVersion} is lower than published ${latestPublished}`,
      suggestedVersion: latestPublished,
      autoResolvable: false,
      reason: 'version-downgrade',
    };
  }

  return {
    action: 'safe-to-publish',
    message: `Version ${localVersion} is safe to publish`,
    suggestedVersion: localVersion,
    autoResolvable: true,
    reason: 'no-conflicts',
  };
}

/**
 * Suggest next semantic version
 */
function suggestNextVersion(currentVersion) {
  const semver = parseSemVer(currentVersion);
  return `${semver.major}.${semver.minor}.${semver.patch + 1}`;
}

/**
 * Parse semantic version string
 */
function parseSemVer(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    // Default to 0.0.0 if parsing fails
    return { major: 0, minor: 0, patch: 0 };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Compare two semantic versions
 */
function compareSemVer(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/**
 * Format semantic version object to string
 */
function formatSemVer(semver) {
  return `${semver.major}.${semver.minor}.${semver.patch}`;
}

export async function getNpmPackageInfo(packageName) {
  try {
    const result = execSync(`npm view ${packageName} --json`, {
      encoding: 'utf8',
    });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

export async function checkPackageConfig(packagePath) {
  const packageJsonPath = `${packagePath}/package.json`;

  if (!existsSync(packageJsonPath)) {
    return {
      valid: false,
      errors: ['package.json not found'],
    };
  }

  try {
    const { readFileSync } = await import('fs');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

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
