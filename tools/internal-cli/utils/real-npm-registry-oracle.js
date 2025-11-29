/**
 * Real NPM Registry Oracle - Actually checks npm registry for version conflicts
 * This fixes the critical false positive issue in the original deployment failure
 */

import { execSync } from 'child_process';

/**
 * Real NPM Registry Oracle that actually queries the npm registry
 * instead of making false assumptions about version availability
 */
export class RealNpmRegistryOracle {
  constructor(options = {}) {
    this.name = 'RealNpmRegistryOracle';
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
    this.registryUrl = options.registryUrl || 'https://registry.npmjs.org';
    this.timeout = options.timeout || 10000; // 10 seconds timeout
  }

  /**
   * Check if a package version actually exists in npm registry
   * This is the CRITICAL function that was missing from the original implementation
   */
  async checkPackageExists(packageName, version) {
    const cacheKey = `${packageName}@${version}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      console.log(`🔍 [RealNpmOracle] Checking npm registry for ${packageName}@${version}`);

      // Method 1: Use npm view command (most reliable)
      const result = this.checkWithNpmView(packageName, version);

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.log(`❌ [RealNpmOracle] Failed to check ${packageName}@${version}:`, error.message);

      // Fall back to HTTP request if npm view fails
      return this.checkWithHttp(packageName, version);
    }
  }

  /**
   * Use npm view command to check if package version exists
   * This is the most reliable method as it uses npm's own registry logic
   */
  checkWithNpmView(packageName, version) {
    try {
      // Use npm view with timeout and error handling
      const command = `npm view ${packageName}@${version} version --json`;
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: this.timeout,
        stdio: 'pipe', // Suppress output
      });

      // If we get here, the package exists
      const versionData = JSON.parse(result.trim());

      console.log(`✅ [RealNpmOracle] Package exists: ${packageName}@${versionData}`);

      return {
        exists: true,
        version: versionData,
        packageInfo: {
          published: true,
          publishTime: new Date().toISOString(), // We could get more detailed info if needed
          size: 'unknown',
        },
        source: 'npm-registry',
        confidence: 1.0,
        lastChecked: Date.now(),
      };
    } catch (error) {
      // npm view throws error if package doesn't exist
      if (error.status === 1 || error.message.includes('E404')) {
        console.log(
          `✅ [RealNpmOracle] Package does NOT exist: ${packageName}@${version} (safe to publish)`,
        );
        return {
          exists: false,
          version,
          packageInfo: {
            published: false,
            reason: 'Not found in registry',
          },
          source: 'npm-registry',
          confidence: 1.0,
          lastChecked: Date.now(),
        };
      }

      // Other errors (network, timeout, etc.)
      throw error;
    }
  }

  /**
   * Fallback HTTP method to check npm registry
   */
  async checkWithHttp(packageName, version) {
    const url = `${this.registryUrl}/${packageName.replace('/', '%2F')}`;

    try {
      const response = await fetch(`${url}/${version}`, {
        method: 'HEAD',
        timeout: this.timeout,
      });

      const exists = response.ok;

      console.log(
        `${exists ? '✅' : '❌'} [RealNpmOracle] HTTP check: ${packageName}@${version} ${exists ? 'EXISTS' : 'NOT FOUND'}`,
      );

      return {
        exists,
        version,
        packageInfo: {
          published: exists,
          publishTime: exists ? response.headers.get('last-modified') || 'unknown' : null,
        },
        source: 'http-registry',
        confidence: 0.9, // Slightly lower confidence for HTTP method
        lastChecked: Date.now(),
      };
    } catch (error) {
      console.log(
        `❌ [RealNpmOracle] HTTP check failed for ${packageName}@${version}:`,
        error.message,
      );

      // If HTTP fails, we can't be certain - return low confidence result
      return {
        exists: false, // Assume safe to publish
        version,
        packageInfo: {
          published: false,
          reason: 'Unable to verify due to network error',
          warning: 'Manual verification recommended',
        },
        source: 'http-registry-failed',
        confidence: 0.3, // Low confidence due to failure
        lastChecked: Date.now(),
        error: error.message,
      };
    }
  }

  /**
   * Get all published versions of a package
   */
  async getAllVersions(packageName) {
    const cacheKey = `${packageName}_versions`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      console.log(`📋 [RealNpmOracle] Getting all versions for ${packageName}`);

      const command = `npm view ${packageName} versions --json`;
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: this.timeout,
        stdio: 'pipe',
      });

      const versions = JSON.parse(result.trim());

      const versionData = {
        packageName,
        versions: Array.isArray(versions) ? versions : [],
        lastChecked: Date.now(),
        source: 'npm-registry',
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: versionData,
        timestamp: Date.now(),
      });

      console.log(`📋 [RealNpmOracle] Found ${versions.length} versions for ${packageName}`);
      return versionData;
    } catch (error) {
      console.log(`❌ [RealNpmOracle] Failed to get versions for ${packageName}:`, error.message);

      return {
        packageName,
        versions: [],
        lastChecked: Date.now(),
        source: 'npm-registry-failed',
        error: error.message,
      };
    }
  }

  /**
   * Check for version conflicts and suggest next version if needed
   */
  async analyzePackageVersion(packageName, currentVersion) {
    console.log(`\n🔍 [RealNpmOracle] Analyzing ${packageName}@${currentVersion}`);

    const packageExists = await this.checkPackageExists(packageName, currentVersion);
    const allVersions = await this.getAllVersions(packageName);

    const analysis = {
      packageName,
      currentVersion,
      exists: packageExists.exists,
      conflict: false,
      recommendation: 'publish',
      confidence: packageExists.confidence,
      registryData: packageExists,
    };

    // CRITICAL: Detect actual version conflicts
    if (packageExists.exists) {
      console.log(
        `🚨 [RealNpmOracle] VERSION CONFLICT DETECTED: ${packageName}@${currentVersion} already exists!`,
      );

      analysis.conflict = true;
      analysis.recommendation = 'version-bump';

      // Suggest next version based on existing versions
      const nextVersion = this.suggestNextVersion(currentVersion, allVersions.versions);
      analysis.suggestedVersion = nextVersion;
      analysis.conflictType = 'version-exists';
      analysis.conflictSeverity = 'high';
    } else {
      console.log(
        `✅ [RealNpmOracle] SAFE TO PUBLISH: ${packageName}@${currentVersion} does not exist`,
      );
    }

    return analysis;
  }

  /**
   * Suggest next version based on semantic versioning
   */
  suggestNextVersion(currentVersion, existingVersions) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Try patch version first
    const nextPatch = patch + 1;
    const patchVersion = `${major}.${minor}.${nextPatch}`;

    if (!existingVersions.includes(patchVersion)) {
      return patchVersion;
    }

    // Try minor version
    const nextMinor = minor + 1;
    const minorVersion = `${major}.${nextMinor}.0`;

    if (!existingVersions.includes(minorVersion)) {
      return minorVersion;
    }

    // Fall back to major version
    const nextMajor = major + 1;
    return `${nextMajor}.0.0`;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();

    console.log(`🧹 [RealNpmOracle] Cache cleared`);
  }

  /**
   * Get oracle status
   */
  getStatus() {
    return {
      name: this.name,
      registryUrl: this.registryUrl,
      cacheSize: this.cache.size,
      lastActivity: Date.now(),
      status: 'active',
    };
  }
}

export default RealNpmRegistryOracle;
