/**
 * Corrected Oracle Intelligence Package Analyzer
 * Fixes the critical version conflict detection false positive issue
 * Integrates real npm registry checking with our Oracle Intelligence system
 */

import { RealNpmRegistryOracle } from './real-npm-registry-oracle.js';
import { readFile } from 'fs/promises';

/**
 * Corrected Oracle Intelligence Package Analyzer
 * This version actually checks the npm registry instead of producing false positives
 */
export class CorrectedOracleIntelligenceAnalyzer {
  constructor(options = {}) {
    this.name = 'CorrectedOracleIntelligenceAnalyzer';
    this.options = {
      consensusThreshold: 0.7,
      enableRealRegistryCheck: true,
      ...options,
    };

    // Initialize oracles with REAL npm registry oracle
    this.oracles = {
      // CRITICAL: Real NPM Registry Oracle that actually checks if versions exist
      realNpmOracle: new RealNpmRegistryOracle({
        timeout: 15000,
        cacheTimeout: 5 * 60 * 1000,
      }),

      // Keep existing oracles for additional intelligence
      localStateOracle: {
        name: 'LocalStateOracle',
        checkPackage: async (packageName, version, packagePath) => {
          try {
            const packageJsonPath = `${packagePath}/package.json`;
            const packageData = JSON.parse(await readFile(packageJsonPath, 'utf8'));

            return {
              exists: true,
              version: packageData.version,
              localState: 'package-json-found',
              confidence: 0.9,
              packagePath,
              packageData,
            };
          } catch (_error) {
            return {
              exists: false,
              version,
              localState: 'package-json-not-found',
              confidence: 0.8,
              error: _error.message,
            };
          }
        },
      },

      buildOracle: {
        name: 'BuildOracle',
        checkPackage: async (packageName, version, packagePath) => {
          try {
            // Check if build artifacts exist
            const distPath = `${packagePath}/dist`;
            const hasDist = await this.pathExists(distPath);

            return {
              exists: hasDist,
              buildState: hasDist ? 'built' : 'not-built',
              confidence: hasDist ? 0.8 : 0.6,
              packagePath,
              distPath,
            };
          } catch (_error) {
            return {
              exists: false,
              buildState: 'build-check-failed',
              confidence: 0.5,
              error: _error.message,
            };
          }
        },
      },

      semanticVersionOracle: {
        name: 'SemanticVersionOracle',
        checkPackage: async (packageName, version) => {
          const semverValid = this.isValidSemver(version);
          const isPrerelease = version.includes('-');

          return {
            exists: semverValid,
            versionType: this.classifyVersion(version),
            isPrerelease,
            confidence: semverValid ? 0.9 : 0.3,
            version,
          };
        },
      },
    };

    this.analysisHistory = [];
  }

  /**
   * CRITICAL FUNCTION: Analyze package with REAL registry checking
   * This fixes the original false positive issue
   */
  async analyzePackageWithRealRegistryCheck(packageName, version, packagePath) {
    console.log(`\n🚀 [CorrectedAnalyzer] Starting REAL analysis for ${packageName}@${version}`);

    console.log(`📁 Package path: ${packagePath}`);

    const startTime = Date.now();
    const results = [];

    // Step 1: CRITICAL - Check real npm registry first

    console.log(`\n🔍 Step 1: REAL NPM Registry Check (this was missing in original)`);
    const realRegistryResult = await this.oracles.realNpmOracle.analyzePackageVersion(
      packageName,
      version,
    );

    results.push({
      oracle: 'RealNpmRegistryOracle',
      success: true,
      confidence: realRegistryResult.confidence,
      data: realRegistryResult,
      critical: true, // Mark this as critical data
    });

    console.log(
      `📊 Registry Result: ${realRegistryResult.exists ? 'CONFLICT' : 'SAFE TO PUBLISH'}`,
    );

    console.log(`📊 Confidence: ${Math.round(realRegistryResult.confidence * 100)}%`);

    // If REAL registry check found a conflict, we can stop early
    if (realRegistryResult.conflict) {
      console.log(`🚨 CRITICAL: Version conflict detected in npm registry!`);

      console.log(`💡 Suggested version: ${realRegistryResult.suggestedVersion}`);

      const finalAnalysis = {
        packageName,
        version,
        overallStatus: 'CONFLICT',
        conflict: true,
        conflictType: 'version-exists',
        confidence: realRegistryResult.confidence,
        analysisTime: Date.now() - startTime,
        oracleResults: results,
        criticalConflict: realRegistryResult,
        recommendations: [
          {
            action: 'version-bump',
            message: `Version ${packageName}@${version} already exists in npm registry`,
            suggestedVersion: realRegistryResult.suggestedVersion,
            autoResolvable: true,
            urgency: 'high',
          },
        ],
        summary: {
          totalOracles: 1,
          consensusScore: realRegistryResult.confidence,
          status: 'version-conflict',
        },
      };

      this.analysisHistory.push(finalAnalysis);
      return finalAnalysis;
    }

    // Step 2: Run additional oracles only if no registry conflict

    console.log(`\n✅ No registry conflicts found. Running additional oracles...`);

    const additionalOracles = [
      this.oracles.localStateOracle,
      this.oracles.buildOracle,
      this.oracles.semanticVersionOracle,
    ];

    for (const oracle of additionalOracles) {
      try {
        console.log(`🔍 Checking ${oracle.name}...`);
        const result = await oracle.checkPackage(packageName, version, packagePath);

        results.push({
          oracle: oracle.name,
          success: true,
          confidence: result.confidence,
          data: result,
        });

        console.log(`  ✅ ${oracle.name}: ${result.confidence > 0.7 ? 'OK' : 'WARNING'}`);
      } catch (_error) {
        console.log(`  ❌ ${oracle.name} failed: ${_error.message}`);
        results.push({
          oracle: oracle.name,
          success: false,
          confidence: 0,
          error: _error.message,
        });
      }
    }

    // Step 3: Analyze all results and generate final assessment
    const finalAnalysis = this.generateFinalAnalysis(
      packageName,
      version,
      packagePath,
      results,
      startTime,
    );

    this.analysisHistory.push(finalAnalysis);
    return finalAnalysis;
  }

  /**
   * Generate final analysis based on all oracle results
   */
  generateFinalAnalysis(packageName, version, packagePath, results, startTime) {
    const analysisTime = Date.now() - startTime;
    const successfulOracles = results.filter(r => r.success);
    const averageConfidence =
      successfulOracles.reduce((sum, r) => sum + r.confidence, 0) /
      Math.max(1, successfulOracles.length);

    // CRITICAL: Check if registry check was successful
    const registryCheck = results.find(r => r.oracle === 'RealNpmRegistryOracle');
    if (!registryCheck || !registryCheck.success) {
      return {
        packageName,
        version,
        overallStatus: 'ERROR',
        conflict: true,
        conflictType: 'registry-check-failed',
        confidence: 0.2,
        analysisTime,
        oracleResults: results,
        criticalConflict: null,
        recommendations: [
          {
            action: 'manual-verify',
            message: 'Failed to verify npm registry. Manual verification required.',
            autoResolvable: false,
            urgency: 'high',
          },
        ],
        summary: {
          totalOracles: results.length,
          consensusScore: 0.2,
          status: 'registry-check-failed',
        },
      };
    }

    // Check for other potential conflicts
    const warnings = successfulOracles.filter(
      r => r.confidence < 0.7 && r.oracle !== 'RealNpmRegistryOracle',
    );

    const finalStatus = warnings.length === 0 ? 'SAFE_TO_PUBLISH' : 'WARNING';
    const conflict = false;

    return {
      packageName,
      version,
      overallStatus: finalStatus,
      conflict,
      confidence: averageConfidence,
      analysisTime,
      oracleResults: results,
      criticalConflict: null,
      recommendations: this.generateRecommendations(finalStatus, warnings, successfulOracles),
      summary: {
        totalOracles: results.length,
        consensusScore: averageConfidence,
        status: finalStatus.toLowerCase(),
      },
    };
  }

  /**
   * Generate recommendations based on analysis results
   */
  generateRecommendations(status, warnings, _successfulOracles) {
    const recommendations = [];

    if (status === 'SAFE_TO_PUBLISH') {
      recommendations.push({
        action: 'publish',
        message: 'Package is safe to publish. No conflicts detected.',
        autoResolvable: true,
        urgency: 'normal',
      });
    }

    if (warnings.length > 0) {
      recommendations.push({
        action: 'review-warnings',
        message: `Found ${warnings.length} warnings. Review recommended before publishing.`,
        autoResolvable: false,
        urgency: 'medium',
        warnings: warnings.map(w => w.oracle),
      });
    }

    return recommendations;
  }

  /**
   * Analyze multiple packages
   */
  async analyzeMultiplePackages(packages) {
    console.log(
      `\n🚀 [CorrectedAnalyzer] Analyzing ${packages.length} packages with REAL registry checks`,
    );

    const results = [];
    const startTime = Date.now();

    for (const pkg of packages) {
      console.log(`\n${'='.repeat(80)}`);
      const result = await this.analyzePackageWithRealRegistryCheck(
        pkg.name,
        pkg.version,
        pkg.path,
      );
      results.push(result);
    }

    const totalTime = Date.now() - startTime;

    return {
      totalPackages: packages.length,
      totalTime,
      averageTimePerPackage: totalTime / packages.length,
      results,
      summary: this.generateMultiPackageSummary(results),
    };
  }

  /**
   * Generate summary for multiple package analysis
   */
  generateMultiPackageSummary(results) {
    const conflicts = results.filter(r => r.conflict);
    const safeToPublish = results.filter(r => !r.conflict && r.overallStatus === 'SAFE_TO_PUBLISH');
    const warnings = results.filter(r => !r.conflict && r.overallStatus === 'WARNING');

    return {
      totalPackages: results.length,
      conflicts: conflicts.length,
      safeToPublish: safeToPublish.length,
      warnings: warnings.length,
      overallStatus: conflicts.length > 0 ? 'HAS_CONFLICTS' : 'SAFE_TO_PUBLISH',
      recommendation: conflicts.length > 0 ? 'resolve-conflicts' : 'can-publish',
    };
  }

  // Utility methods
  async pathExists(path) {
    try {
      await readFile(path);
      return true;
    } catch {
      return false;
    }
  }

  isValidSemver(version) {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  classifyVersion(version) {
    if (version.includes('-')) return 'prerelease';
    if (version.endsWith('.0')) return 'major';
    if (version.includes('.0.')) return 'minor';
    return 'patch';
  }

  /**
   * Get analysis history
   */
  getHistory() {
    return this.analysisHistory;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.analysisHistory = [];

    console.log(`🧹 [CorrectedAnalyzer] Analysis history cleared`);
  }
}

export default CorrectedOracleIntelligenceAnalyzer;
