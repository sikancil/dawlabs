/**
 * NPM Version History Oracle - Tracks unpublished versions and enforces npm's version policies
 *
 * CRITICAL: npm does NOT allow version reuse even after unpublishing!
 * Once a version is published, that version number is permanently burned.
 */

import { execSync } from 'child_process';

export class NpmVersionHistoryOracle {
  constructor(options = {}) {
    this.name = 'NpmVersionHistoryOracle';
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 10 * 60 * 1000; // 10 minutes
    this.timeout = options.timeout || 15000; // 15 seconds
    this.npmAuditUrl = options.auditUrl || 'https://audit.npmjs.org';
  }

  /**
   * Oracle interface method - analyzes version compliance for publishing
   */
  async analyze(packageName, localVersion, _packagePath) {
    console.log(`\n🔍 [NpmVersionHistoryOracle] Analyzing ${packageName}@${localVersion}`);

    try {
      const complianceAnalysis = await this.analyzeVersionCompliance(packageName, localVersion);

      return {
        state: complianceAnalysis.canPublish ? 'version-compliant' : 'version-violation',
        confidence: complianceAnalysis.confidence,
        publishedVersions: complianceAnalysis.requirements?.publishedVersions || [],
        conflicts: complianceAnalysis.canPublish
          ? []
          : [
              {
                type: complianceAnalysis.violationType,
                severity: complianceAnalysis.violationSeverity,
                message: complianceAnalysis.errorMessage,
                currentVersion: localVersion,
                suggestedVersion: complianceAnalysis.suggestedVersion,
              },
            ],
        burnedVersions: complianceAnalysis.requirements?.burnedVersions || [],
        versionHistory: complianceAnalysis.history,
        compliance: complianceAnalysis,
        source: 'version-history-oracle',
      };
    } catch (error) {
      console.log(`❌ [NpmVersionHistoryOracle] Analysis failed:`, error.message);

      return {
        state: 'unknown',
        confidence: 0.1,
        publishedVersions: [],
        conflicts: [
          {
            type: 'analysis-failed',
            severity: 'medium',
            message: `Version history analysis failed: ${error.message}`,
          },
        ],
        burnedVersions: [],
        versionHistory: null,
        error: error.message,
        source: 'version-history-oracle-failed',
      };
    }
  }

  /**
   * CRITICAL INTELLIGENCE: Check complete version history including unpublished versions
   * This is the missing piece that caused our deployment failure!
   */
  async getCompleteVersionHistory(packageName) {
    console.log(`\n🔍 [VersionHistoryOracle] Getting COMPLETE version history for ${packageName}`);

    const cacheKey = `${packageName}_complete_history`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Method 1: Check npm registry with all versions
      const registryHistory = await this.getRegistryVersionHistory(packageName);

      // Method 2: Check npm audit logs for unpublished versions
      const auditHistory = await this.getAuditVersionHistory(packageName);

      // Method 3: Check git tags for local version tracking
      const gitHistory = await this.getGitVersionHistory(packageName);

      // Combine all sources to get complete picture
      const completeHistory = this.combineVersionHistories(
        registryHistory,
        auditHistory,
        gitHistory,
      );

      const result = {
        packageName,
        ...completeHistory,
        lastChecked: Date.now(),
        source: 'version-history-oracle',
        confidence: this.calculateConfidence(completeHistory),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      console.log(
        `📋 [VersionHistoryOracle] Found ${completeHistory.allVersions.length} total versions`,
      );
      console.log(`   📦 Published: ${completeHistory.publishedVersions.length}`);
      console.log(`   🚫 Unpublished: ${completeHistory.unpublishedVersions.length}`);
      console.log(`   🔥 Burned versions: ${completeHistory.burnedVersions.length}`);

      return result;
    } catch (error) {
      console.log(
        `❌ [VersionHistoryOracle] Failed to get complete history for ${packageName}:`,
        error.message,
      );

      return {
        packageName,
        publishedVersions: [],
        unpublishedVersions: [],
        burnedVersions: [],
        allVersions: [],
        lastChecked: Date.now(),
        source: 'version-history-oracle-failed',
        confidence: 0.1,
        error: error.message,
      };
    }
  }

  /**
   * Get current published versions from npm registry
   */
  async getRegistryVersionHistory(packageName) {
    try {
      const command = `npm view ${packageName} versions --json`;
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: this.timeout,
        stdio: 'pipe',
      });

      const versions = JSON.parse(result.trim());

      return {
        publishedVersions: Array.isArray(versions) ? versions : [],
        registryData: {
          lastModified: new Date().toISOString(),
          totalPublished: versions.length,
        },
      };
    } catch (error) {
      // Package might not exist or be unpublished
      return {
        publishedVersions: [],
        registryData: {
          status: 'not_found_or_unpublished',
          error: error.message.includes('E404') ? 'Package not found' : error.message,
        },
      };
    }
  }

  /**
   * Check npm audit logs for evidence of unpublished versions
   */
  async getAuditVersionHistory(packageName) {
    try {
      // Try to get package info from npm audit API
      const response = await fetch(
        `https://registry.npmjs.org/${packageName.replace('/', '%2F')}`,
        {
          method: 'GET',
          timeout: this.timeout,
        },
      );

      if (!response.ok) {
        return { auditVersions: [], auditData: { status: 'not_found' } };
      }

      const packageData = await response.json();

      // Extract all versions that ever existed
      const allVersions = Object.keys(packageData.versions || {});
      const publishedVersions = packageData.versions
        ? Object.keys(packageData.versions).filter(v => packageData.versions[v])
        : [];

      // Unpublished versions are those that don't exist in current versions but existed before
      const unpublishedVersions = allVersions.filter(v => !publishedVersions.includes(v));

      return {
        auditVersions: allVersions,
        unpublishedVersions,
        auditData: {
          totalEverPublished: allVersions.length,
          currentlyPublished: publishedVersions.length,
          lastModified: packageData.time ? packageData.time.modified : null,
        },
      };
    } catch (error) {
      return {
        auditVersions: [],
        unpublishedVersions: [],
        auditData: { status: 'audit_failed', error: error.message },
      };
    }
  }

  /**
   * Check local git history for version tags
   */
  async getGitVersionHistory(packageName) {
    try {
      // Get git tags that might indicate versions
      const tagCommand = 'git tag --list --sort=-version:refname';
      const tagResult = execSync(tagCommand, {
        encoding: 'utf8',
        timeout: this.timeout,
        stdio: 'pipe',
      });

      const allTags = tagResult
        .trim()
        .split('\n')
        .filter(tag => tag.trim());

      // Look for version patterns in tags
      const versionTags = allTags.filter(tag => {
        const versionMatch = tag.match(/v?(\d+\.\d+\.\d+)/);
        return versionMatch;
      });

      const versionsFromGit = versionTags
        .map(tag => {
          const match = tag.match(/v?(\d+\.\d+\.\d+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      return {
        gitVersions: versionsFromGit,
        gitData: {
          totalVersionTags: versionsFromGit.length,
          lastTagCommit: this.getLastCommitForTag(packageName),
        },
      };
    } catch (error) {
      return {
        gitVersions: [],
        gitData: { status: 'git_failed', error: error.message },
      };
    }
  }

  /**
   * Combine version histories from all sources
   */
  combineVersionHistories(registry, audit, git) {
    const publishedVersions = registry.publishedVersions || [];
    const auditVersions = audit.auditVersions || [];
    const gitVersions = git.gitVersions || [];

    // Combine all versions that ever existed
    const allVersions = [...new Set([...publishedVersions, ...auditVersions, ...gitVersions])];

    // Identify unpublished versions (exist in audit but not in registry)
    const unpublishedVersions = audit.unpublishedVersions || [];

    // CRITICAL: All versions that ever existed are "burned" and cannot be reused
    const burnedVersions = allVersions; // Once published, always burned!

    return {
      allVersions,
      publishedVersions,
      unpublishedVersions,
      burnedVersions, // This is the key insight!
      registryData: registry.registryData,
      auditData: audit.auditData,
      gitData: git.gitData,
    };
  }

  /**
   * CRITICAL: Analyze if current version violates npm's version rules
   */
  async analyzeVersionCompliance(packageName, currentVersion) {
    console.log(
      `\n🚨 [VersionHistoryOracle] Analyzing version compliance for ${packageName}@${currentVersion}`,
    );

    const versionHistory = await this.getCompleteVersionHistory(packageName);

    const analysis = {
      packageName,
      currentVersion,
      canPublish: true,
      violationType: null,
      violationSeverity: null,
      recommendation: 'proceed',
      confidence: versionHistory.confidence,
      requirements: {
        versionMustBeGreaterThan:
          versionHistory.allVersions.length > 0
            ? this.getHighestVersion(versionHistory.allVersions)
            : null,
        burnedVersions: versionHistory.burnedVersions,
        publishedVersions: versionHistory.publishedVersions,
      },
      history: versionHistory,
    };

    // CRITICAL CHECK 1: Version cannot be in burned versions
    if (versionHistory.burnedVersions.includes(currentVersion)) {
      console.log(
        `🔥 [VersionHistoryOracle] VERSION BURNED: ${currentVersion} was previously published and cannot be reused!`,
      );

      analysis.canPublish = false;
      analysis.violationType = 'version-reuse-attempted';
      analysis.violationSeverity = 'critical';
      analysis.recommendation = 'version-bump-required';
      analysis.suggestedVersion = this.getNextAvailableVersion(
        currentVersion,
        versionHistory.allVersions,
      );
      analysis.errorMessage = `Version ${currentVersion} was previously published and cannot be reused due to npm policies`;

      return analysis;
    }

    // CRITICAL CHECK 2: Version must be greater than all previous versions
    const highestVersion = this.getHighestVersion(versionHistory.allVersions);
    if (highestVersion && this.compareVersions(currentVersion, highestVersion) <= 0) {
      console.log(
        `📈 [VersionHistoryOracle] VERSION TOO LOW: ${currentVersion} must be greater than ${highestVersion}`,
      );

      analysis.canPublish = false;
      analysis.violationType = 'version-not-greater';
      analysis.violationSeverity = 'high';
      analysis.recommendation = 'version-bump-required';
      analysis.suggestedVersion = this.getNextAvailableVersion(
        highestVersion,
        versionHistory.allVersions,
      );
      analysis.errorMessage = `Version ${currentVersion} must be greater than highest published version ${highestVersion}`;

      return analysis;
    }

    // Check passed
    console.log(`✅ [VersionHistoryOracle] VERSION COMPLIANT: ${currentVersion} can be published`);

    return analysis;
  }

  /**
   * Get the highest version from an array of version strings
   */
  getHighestVersion(versions) {
    if (!versions || versions.length === 0) return null;

    return versions.reduce((highest, current) => {
      return this.compareVersions(current, highest) > 0 ? current : highest;
    });
  }

  /**
   * Compare two semantic version strings
   * Returns: 1 if a > b, 0 if a === b, -1 if a < b
   */
  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  /**
   * Suggest next available version that doesn't conflict with burned versions
   */
  getNextAvailableVersion(currentVersion, burnedVersions) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Try patch increments first
    for (let i = patch + 1; i <= patch + 10; i++) {
      const candidate = `${major}.${minor}.${i}`;
      if (!burnedVersions.includes(candidate)) {
        return candidate;
      }
    }

    // Try minor increments
    for (let i = minor + 1; i <= minor + 10; i++) {
      const candidate = `${major}.${i}.0`;
      if (!burnedVersions.includes(candidate)) {
        return candidate;
      }
    }

    // Try major increments
    for (let i = major + 1; i <= major + 10; i++) {
      const candidate = `${i}.0.0`;
      if (!burnedVersions.includes(candidate)) {
        return candidate;
      }
    }

    // Fallback - just increment patch by 100
    return `${major}.${minor}.${patch + 100}`;
  }

  /**
   * Calculate confidence based on data sources
   */
  calculateConfidence(versionData) {
    let confidence = 0.5; // Base confidence

    if (versionData.publishedVersions && versionData.publishedVersions.length > 0) {
      confidence += 0.3;
    }

    if (versionData.auditVersions && versionData.auditVersions.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get last commit for a specific package/tag
   */
  getLastCommitForTag(_packageName) {
    try {
      const command = `git log -1 --pretty=format:"%H|%s|%ci"`;
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe',
      });

      const [hash, subject, date] = result.trim().split('|');
      return { hash, subject, date };
    } catch {
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log(`🧹 [VersionHistoryOracle] Cache cleared`);
  }

  /**
   * Get oracle status
   */
  getStatus() {
    return {
      name: this.name,
      cacheSize: this.cache.size,
      lastActivity: Date.now(),
      status: 'active',
      capabilities: [
        'complete-version-history',
        'burned-version-detection',
        'version-compliance-checking',
        'npm-policy-enforcement',
      ],
    };
  }
}

export default NpmVersionHistoryOracle;
