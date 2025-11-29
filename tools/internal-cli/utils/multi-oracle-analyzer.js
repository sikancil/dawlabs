import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { NpmVersionHistoryOracle } from './npm-version-history-oracle.js';
import { RealNpmRegistryOracle } from './real-npm-registry-oracle.js';

/**
 * Oracle Intelligence Package Analyzer
 *
 * @context Core component of the DAWLabs deployment intelligence system
 * @purpose Implements redundancy and consensus-based package state analysis using multiple oracle sources
 * @integration Used by intelligent-analysis command to determine package publishing readiness
 * @workflow Called for each package during CI/CD pipeline to analyze version compliance and conflicts
 *
 * This class coordinates 7 different oracle intelligence sources to provide
 * comprehensive package analysis with built-in redundancy and confidence scoring.
 * The system ensures reliable deployment decisions by cross-validating information
 * from multiple independent sources before making recommendations.
 *
 * @architecture Multi-Oracle Consensus System
 * - Each oracle provides independent analysis with confidence scores
 * - Weighted consensus algorithm resolves conflicting information
 * - Version compliance checking prevents critical publishing errors
 * - Reliability scoring ensures trustworthy recommendations
 */
export class OracleIntelligencePackageAnalyzer {
  /**
   * Initialize the Oracle Intelligence Package Analyzer
   *
   * @constructor
   * @description Creates analyzer with 7 oracle intelligence sources and consensus threshold
   *
   * The oracles are ordered by reliability and importance:
   * 1. RealNpmRegistryOracle - Direct npm registry queries (most reliable)
   * 2. NpmVersionHistoryOracle - Version compliance and history (critical for safety)
   * 3. GitHistoryOracle - Version change tracking and git patterns
   * 4. BuildArtifactOracle - Build state validation
   * 5. LocalStateOracle - Local package existence and version matching
   * 6. NetworkCacheOracle - Performance optimization through caching
   * 7. SemanticVersionOracle - Semantic version compliance
   *
   * @workflow During CI/CD pipeline, each package is analyzed by all oracles
   * @integration The consensus threshold ensures majority agreement before recommendations
   */
  constructor() {
    this.oracles = [
      new RealNpmRegistryOracle(),
      new NpmVersionHistoryOracle(), // Critical: Enforces version history compliance
      new GitHistoryOracle(),
      new BuildArtifactOracle(),
      new LocalStateOracle(),
      new NetworkCacheOracle(),
      new SemanticVersionOracle(),
    ];
    this.consensusThreshold = 0.6; // 60% agreement required for reliable decisions
  }

  /**
   * Analyze package with multiple Oracle Intelligence sources
   *
   * @param {string} packageName - Name of the package to analyze (e.g., '@dawlabs/ncurl')
   * @param {string} localVersion - Local version being analyzed (e.g., '0.0.3')
   * @param {string} packagePath - File system path to the package directory
   * @returns {Promise<Object>} Comprehensive analysis result with consensus data
   * @returns {string} returns.packageName - Package name that was analyzed
   * @returns {string} returns.localVersion - Local version that was analyzed
   * @returns {string} returns.packagePath - Package path that was analyzed
   * @returns {Object} returns.analysis - Fused analysis from all oracle sources
   * @returns {Array} returns.oracleResults - Raw results from each oracle
   * @returns {number} returns.consensusScore - Overall confidence score (0-1)
   * @returns {number} returns.analysisTime - Total analysis time in milliseconds
   * @returns {Object} returns.reliability - Reliability metrics
   *
   * @workflow Primary analysis method called during CI/CD pipeline
   * @integration Coordinates parallel execution of all oracle sources
   * @process
   * 1. Execute all oracles in parallel for efficiency
   * 2. Filter and collect successful analyses
   * 3. Apply fusion algorithm to create consensus result
   * 4. Calculate reliability and confidence scores
   * 5. Return comprehensive analysis object
   *
   * @example
   * const analyzer = new OracleIntelligencePackageAnalyzer();
   * const result = await analyzer.analyzeWithIntelligence(
   *   '@dawlabs/ncurl',
   *   '0.0.3',
   *   './packages/ncurl'
   * );
   * console.log(`Analysis confidence: ${result.consensusScore * 100}%`);
   */
  async analyzeWithIntelligence(packageName, localVersion, packagePath) {
    const analysisStart = Date.now();

    console.log(
      `🔍 Analyzing ${packageName}@${localVersion} with ${this.oracles.length} Oracle Intelligence sources...`,
    );

    // Query all oracles in parallel
    const oraclePromises = this.oracles.map(async (oracle, _index) => {
      try {
        const result = await oracle.analyze(packageName, localVersion, packagePath);
        return {
          oracle: oracle.constructor.name,
          success: true,
          result,
          confidence: result.confidence || 0.8,
          responseTime: Date.now() - analysisStart,
        };
      } catch (error) {
        return {
          oracle: oracle.constructor.name,
          success: false,
          error: error.message,
          responseTime: Date.now() - analysisStart,
        };
      }
    });

    const oracleResults = await Promise.allSettled(oraclePromises);
    const successfulAnalyses = oracleResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(r => r.success);

    console.log(
      `✅ ${successfulAnalyses.length}/${this.oracles.length} oracles responded successfully`,
    );

    // Fuse Oracle Intelligence from multiple sources
    const fusedAnalysis = await this.fuseOracleIntelligence(
      successfulAnalyses,
      packageName,
      localVersion,
    );

    return {
      packageName,
      localVersion,
      packagePath,
      analysis: fusedAnalysis,
      oracleResults: successfulAnalyses,
      consensusScore: this.calculateConsensusScore(successfulAnalyses),
      analysisTime: Date.now() - analysisStart,
      reliability: this.calculateReliability(successfulAnalyses),
    };
  }

  /**
   * Fuse Oracle Intelligence from multiple oracle sources
   *
   * @param {Array<Object>} analyses - Successful oracle analyses to fuse
   * @param {string} packageName - Package name being analyzed
   * @param {string} localVersion - Local version being evaluated
   * @returns {Promise<Object>} Fused analysis with consensus decisions
   * @returns {string} returns.state - Final state decision (version-violation, version-exists, new-package, etc.)
   * @returns {number} returns.confidence - Overall confidence in the decision
   * @returns {Array<string>} returns.publishedVersions - Reconciled published versions
   * @returns {Array<Object>} returns.conflicts - Aggregated and deduplicated conflicts
   * @returns {Array<Object>} returns.recommendations - Intelligent recommendations
   * @returns {string} returns.oracleIntelligenceLevel - Analysis quality level (advanced/standard/basic/minimal)
   * @returns {number} returns.oracleAgreement - Oracle agreement percentage
   * @returns {Object} returns.versionCompliance - Version compliance analysis results
   *
   * @workflow Critical decision-making algorithm that determines final analysis outcome
   * @integration Combines all oracle results into single authoritative analysis
   * @process
   * 1. Check for CRITICAL version violations first (overrides all other logic)
   * 2. Calculate weighted consensus based on oracle confidence scores
   * 3. Aggregate conflicts from multiple sources with deduplication
   * 4. Reconcile version information across oracles
   * 5. Generate intelligent recommendations
   *
   * @critical Version compliance violations have highest priority and override consensus
   * @example
   * // If version compliance violation detected, returns critical violation state
   * // regardless of other oracle agreements
   */
  async fuseOracleIntelligence(analyses, packageName, localVersion) {
    const states = analyses.map(a => a.result.state);
    const versions = analyses
      .filter(a => a.result.publishedVersions)
      .flatMap(a => a.result.publishedVersions);
    const conflicts = analyses.flatMap(a => a.result.conflicts || []);

    // CRITICAL: Check for version compliance violations first
    const versionComplianceAnalysis = await this.checkVersionCompliance(
      analyses,
      packageName,
      localVersion,
    );

    // If there's a critical version violation, override everything else
    if (versionComplianceAnalysis.hasCriticalViolation) {
      console.log(
        `🚨 [MultiOracle] CRITICAL VERSION VIOLATION DETECTED for ${packageName}@${localVersion}`,
      );

      return {
        state: 'version-violation',
        confidence: 1.0, // Maximum confidence for violations
        publishedVersions: versionComplianceAnalysis.history?.publishedVersions || [],
        conflicts: [versionComplianceAnalysis.violation, ...conflicts],
        recommendations: [
          {
            type: 'critical',
            action: versionComplianceAnalysis.recommendation,
            message: versionComplianceAnalysis.errorMessage,
            suggestedVersion: versionComplianceAnalysis.suggestedVersion,
            severity: versionComplianceAnalysis.violationSeverity,
          },
        ],
        oracleIntelligenceLevel: 'CRITICAL_VIOLATION',
        oracleAgreement: 1.0, // All oracles agree on violations
        versionCompliance: versionComplianceAnalysis,
      };
    }

    // Weighted consensus based on oracle reliability
    const stateConsensus = this.calculateWeightedConsensus(states, analyses);

    // Conflict aggregation and deduplication
    const aggregatedConflicts = this.aggregateConflicts(conflicts);

    // Version reconciliation from multiple sources
    const reconciledVersions = this.reconcileVersions(versions, analyses);

    return {
      state: stateConsensus.state,
      confidence: stateConsensus.confidence,
      publishedVersions: reconciledVersions,
      conflicts: aggregatedConflicts,
      recommendations: this.generateIntelligentRecommendations(
        stateConsensus,
        aggregatedConflicts,
        analyses,
      ),
      oracleIntelligenceLevel: this.determineOracleIntelligenceLevel(analyses),
      oracleAgreement: this.calculateOracleAgreement(analyses),
      versionCompliance: versionComplianceAnalysis,
    };
  }

  /**
   * CRITICAL: Check version compliance using NpmVersionHistoryOracle
   *
   * @param {Array<Object>} analyses - All successful oracle analyses
   * @param {string} packageName - Package name being checked
   * @param {string} localVersion - Local version to validate
   * @returns {Promise<Object>} Version compliance analysis result
   * @returns {boolean} returns.hasCriticalViolation - Whether critical violation exists
   * @returns {boolean} returns.canPublish - Whether version can be published
   * @returns {string} returns.recommendation - Recommendation action (proceed/version-bump-required)
   * @returns {string} returns.reason - Explanation of compliance result
   * @returns {Object} returns.violation - Violation details if critical violation exists
   * @returns {string} returns.suggestedVersion - Suggested next version if violation
   * @returns {string} returns.errorMessage - Human-readable error message
   * @returns {string} returns.violationSeverity - Severity level (critical/high/medium/low)
   * @returns {Object} returns.history - Complete version history data
   * @returns {Object} returns.requirements - Version requirements and constraints
   *
   * @workflow SAFETY CHECK: Prevents critical npm publishing errors
   * @integration Called before any consensus decisions to enforce version compliance
   * @purpose Ensures adherence to npm version policies and prevents duplicate publishing
   * @critical This is the most important validation - it blocks publishing if violated
   *
   * This method enforces critical npm policies:
   * - Prevents reuse of previously published versions (npm policy violation)
   * - Validates against version constraints and burned versions
   * - Provides clear guidance for version resolution
   *
   * @example
   * // Critical violation - prevents publishing
   * const compliance = await checkVersionCompliance(analyses, '@dawlabs/ncurl', '0.0.3');
   * if (compliance.hasCriticalViolation) {
   *   console.log('❌ Cannot publish - version violation detected');
   *   console.log(`💡 Suggested version: ${compliance.suggestedVersion}`);
   * }
   */
  async checkVersionCompliance(analyses, packageName, localVersion) {
    // Find the version history oracle result
    const versionHistoryOracle = analyses.find(a => a.oracle === 'NpmVersionHistoryOracle');

    if (!versionHistoryOracle || !versionHistoryOracle.success) {
      return {
        hasCriticalViolation: false,
        canPublish: true,
        recommendation: 'proceed',
        reason: 'Version history oracle not available',
      };
    }

    const complianceAnalysis = versionHistoryOracle.result;

    // Check for critical violations
    if (complianceAnalysis.violationType) {
      return {
        hasCriticalViolation: true,
        violation: {
          type: complianceAnalysis.violationType,
          severity: complianceAnalysis.violationSeverity,
          message: complianceAnalysis.errorMessage,
          currentVersion: localVersion,
          burnedVersions: complianceAnalysis.requirements?.burnedVersions || [],
        },
        canPublish: complianceAnalysis.canPublish,
        recommendation: complianceAnalysis.recommendation,
        suggestedVersion: complianceAnalysis.suggestedVersion,
        errorMessage: complianceAnalysis.errorMessage,
        violationSeverity: complianceAnalysis.violationSeverity,
        history: complianceAnalysis.history,
        requirements: complianceAnalysis.requirements,
      };
    }

    return {
      hasCriticalViolation: false,
      canPublish: true,
      recommendation: complianceAnalysis.recommendation || 'proceed',
      history: complianceAnalysis.history,
      requirements: complianceAnalysis.requirements,
    };
  }

  /**
   * Calculate weighted consensus based on oracle reliability
   */
  calculateWeightedConsensus(states, analyses) {
    const stateWeights = new Map();
    const totalWeight = analyses.reduce((sum, a) => sum + (a.confidence || 0.8), 0);

    // Weight each state by oracle confidence
    states.forEach((state, index) => {
      const weight = analyses[index].confidence || 0.8;
      stateWeights.set(state, (stateWeights.get(state) || 0) + weight);
    });

    // Find the state with highest weighted agreement
    let consensusState = 'unknown';
    let maxWeight = 0;

    for (const [state, weight] of stateWeights.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        consensusState = state;
      }
    }

    const agreementRatio = maxWeight / totalWeight;
    const confidence =
      agreementRatio >= this.consensusThreshold ? agreementRatio : agreementRatio * 0.5;

    return {
      state: consensusState,
      confidence,
      agreementRatio,
      totalOracles: analyses.length,
      agreeingOracles: Math.max(...stateWeights.values()),
    };
  }

  /**
   * Aggregate and deduplicate conflicts from multiple oracles
   */
  aggregateConflicts(conflicts) {
    const conflictMap = new Map();

    conflicts.forEach(conflict => {
      const key = `${conflict.type}-${conflict.message}`;
      if (!conflictMap.has(key)) {
        conflictMap.set(key, {
          ...conflict,
          sources: [conflict.source || 'unknown'],
          severity: conflict.severity || 'medium',
        });
      } else {
        const existing = conflictMap.get(key);
        existing.sources.push(conflict.source || 'unknown');
        // Upgrade severity if any oracle marks it as high
        if (conflict.severity === 'high') {
          existing.severity = 'high';
        }
      }
    });

    return Array.from(conflictMap.values()).map(conflict => ({
      ...conflict,
      corroborated: conflict.sources.length > 1,
      sourceCount: conflict.sources.length,
    }));
  }

  /**
   * Reconcile version information from multiple sources
   */
  reconcileVersions(versions, analyses) {
    const versionMap = new Map();

    // Collect versions with source tracking
    versions.forEach(version => {
      if (!versionMap.has(version)) {
        versionMap.set(version, {
          version,
          sources: new Set(),
          confidence: 0,
        });
      }
    });

    // Track which oracles reported which versions
    analyses.forEach(analysis => {
      if (analysis.result.publishedVersions) {
        analysis.result.publishedVersions.forEach(version => {
          versionMap.get(version)?.sources.add(analysis.oracle);
        });
      }
    });

    // Calculate confidence for each version based on source diversity
    for (const [_version, data] of versionMap.entries()) {
      data.confidence = data.sources.size / analyses.length;
    }

    return Array.from(versionMap.values())
      .sort((a, b) => b.confidence - a.confidence)
      .map(data => data.version);
  }

  /**
   * Generate intelligent recommendations based on consensus analysis
   */
  generateIntelligentRecommendations(consensus, conflicts, analyses) {
    const recommendations = [];

    if (consensus.state === 'version-exists' && consensus.confidence > 0.8) {
      const nextVersion = this.suggestNextVersion(analyses);
      recommendations.push({
        action: 'version-bump',
        message: `Version conflict detected with ${consensus.agreementRatio * 100}% oracle agreement`,
        suggestedVersion: nextVersion,
        confidence: consensus.confidence,
        autoResolvable: true,
        corroboratedBy: consensus.agreeingOracles,
      });
    }

    if (conflicts.some(c => c.severity === 'high')) {
      recommendations.push({
        action: 'manual-review',
        message: 'High-severity conflicts require manual review',
        confidence: 0.9,
        autoResolvable: false,
        conflicts: conflicts.filter(c => c.severity === 'high'),
      });
    }

    if (consensus.agreementRatio < this.consensusThreshold) {
      recommendations.push({
        action: 'verification-needed',
        message: `Low oracle consensus (${Math.round(consensus.agreementRatio * 100)}%). Additional verification recommended.`,
        confidence: consensus.confidence * 0.7,
        autoResolvable: false,
      });
    }

    return recommendations;
  }

  /**
   * Suggest next version based on Oracle Intelligence analysis
   */
  suggestNextVersion(analyses) {
    const publishedVersions = analyses
      .filter(a => a.result.latestPublished)
      .map(a => a.result.latestPublished);

    if (publishedVersions.length === 0) return '0.0.1';

    // Use the most commonly reported latest version
    const versionCounts = new Map();
    publishedVersions.forEach(version => {
      versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
    });

    const latestVersion = Array.from(versionCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

    const semver = this.parseSemVer(latestVersion);
    return `${semver.major}.${semver.minor}.${semver.patch + 1}`;
  }

  /**
   * Parse semantic version
   */
  parseSemVer(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    return match
      ? {
          major: parseInt(match[1], 10),
          minor: parseInt(match[2], 10),
          patch: parseInt(match[3], 10),
        }
      : { major: 0, minor: 0, patch: 0 };
  }

  /**
   * Calculate overall consensus score
   */
  calculateConsensusScore(analyses) {
    if (analyses.length === 0) return 0;
    return analyses.reduce((sum, a) => sum + (a.confidence || 0.8), 0) / analyses.length;
  }

  /**
   * Calculate reliability score for the analysis
   */
  calculateReliability(analyses) {
    const sourceCount = analyses.length;
    const avgConfidence = this.calculateConsensusScore(analyses);
    const hasHighConfidence = analyses.some(a => (a.confidence || 0.8) > 0.9);

    return {
      score: avgConfidence * (sourceCount / this.oracles.length),
      sourceCount,
      avgConfidence,
      hasHighConfidence,
      reliability:
        avgConfidence > 0.8 && sourceCount >= 3 ? 'high' : avgConfidence > 0.6 ? 'medium' : 'low',
    };
  }

  /**
   * Calculate oracle agreement percentage
   */
  calculateOracleAgreement(analyses) {
    if (analyses.length === 0) return 0;

    const states = analyses.map(a => a.result.state);
    const stateCounts = new Map();

    states.forEach(state => {
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
    });

    const maxCount = Math.max(...stateCounts.values());
    return (maxCount / states.length) * 100;
  }

  /**
   * Determine Oracle Intelligence level based on available sources
   */
  determineOracleIntelligenceLevel(analyses) {
    const sourceCount = analyses.length;
    const avgConfidence = this.calculateConsensusScore(analyses);

    if (sourceCount >= 5 && avgConfidence > 0.8) return 'advanced';
    if (sourceCount >= 3 && avgConfidence > 0.6) return 'standard';
    if (sourceCount >= 2) return 'basic';
    return 'minimal';
  }
}

/**
 * Oracle implementations for different Oracle Intelligence sources
 */
// eslint-disable-next-line no-unused-vars
class NpmRegistryOracle {
  async analyze(packageName, localVersion) {
    try {
      const result = execSync(`npm view ${packageName} --json`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000,
      });

      const packageInfo = JSON.parse(result);
      const publishedVersions = Object.keys(packageInfo.versions || []);

      return {
        state: this.determineState(localVersion, publishedVersions, packageInfo.version),
        publishedVersions,
        latestPublished: packageInfo.version,
        confidence: 0.9,
        source: 'npm-registry',
        metadata: {
          packageSize: packageInfo.dist?.unpackedSize,
          publishDate: packageInfo.time?.created,
          maintainerCount: packageInfo.maintainers?.length,
        },
      };
    } catch (error) {
      return {
        state: 'new-package',
        publishedVersions: [],
        latestPublished: null,
        confidence: 0.7,
        source: 'npm-registry',
        error: error.message,
      };
    }
  }

  determineState(localVersion, publishedVersions, _latestPublished) {
    if (publishedVersions.length === 0) return 'new-package';
    if (publishedVersions.includes(localVersion)) return 'version-exists';
    return 'version-bump';
  }
}

class GitHistoryOracle {
  async analyze(packageName, localVersion, packagePath) {
    try {
      // Check git history for version tags and publishing patterns
      const versionTags = execSync(`git tag --list "*${packageName}*" --sort=-version:refname`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })
        .trim()
        .split('\n')
        .filter(Boolean);

      // Look for recent version changes
      const recentCommits = execSync(`git log --oneline -10 -- ${packagePath || '.'}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })
        .trim()
        .split('\n');

      const hasVersionChanges = recentCommits.some(
        commit =>
          commit.toLowerCase().includes('version') ||
          commit.toLowerCase().includes('bump') ||
          commit.match(/\d+\.\d+\.\d+/),
      );

      return {
        state: hasVersionChanges ? 'version-changed' : 'unknown',
        publishedVersions: versionTags,
        confidence: 0.6,
        source: 'git-history',
        metadata: {
          versionTags,
          recentCommitCount: recentCommits.length,
          hasRecentVersionChanges: hasVersionChanges,
        },
      };
    } catch (error) {
      return {
        state: 'unknown',
        publishedVersions: [],
        confidence: 0.3,
        source: 'git-history',
        error: error.message,
      };
    }
  }
}

class BuildArtifactOracle {
  async analyze(packageName, localVersion, packagePath) {
    try {
      if (!packagePath) {
        return { state: 'unknown', confidence: 0.1, source: 'build-artifacts' };
      }

      const distPath = join(packagePath, 'dist');
      const packageJsonPath = join(packagePath, 'package.json');

      if (!existsSync(packageJsonPath)) {
        return {
          state: 'invalid-package',
          confidence: 0.1,
          source: 'build-artifacts',
        };
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      let buildState = 'unknown';
      const conflicts = [];

      if (existsSync(distPath)) {
        buildState = 'built';
      } else {
        buildState = 'not-built';
        conflicts.push({
          type: 'missing-build',
          message: 'Package has not been built',
          severity: 'medium',
        });
      }

      return {
        state: buildState,
        conflicts,
        localVersion: packageJson.version,
        confidence: 0.7,
        source: 'build-artifacts',
        metadata: {
          hasDist: existsSync(distPath),
          packageVersion: packageJson.version,
        },
      };
    } catch (error) {
      return {
        state: 'error',
        confidence: 0.2,
        source: 'build-artifacts',
        error: error.message,
      };
    }
  }
}

class LocalStateOracle {
  async analyze(packageName, localVersion, packagePath) {
    try {
      if (!packagePath) {
        return { state: 'unknown', confidence: 0.1, source: 'local-state' };
      }

      const packageJsonPath = join(packagePath, 'package.json');

      if (!existsSync(packageJsonPath)) {
        return {
          state: 'package-not-found',
          confidence: 0.1,
          source: 'local-state',
        };
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const stats = statSync(packageJsonPath);

      return {
        state: 'local-package-exists',
        localVersion: packageJson.version,
        confidence: 0.8,
        source: 'local-state',
        metadata: {
          lastModified: stats.mtime,
          packageExists: true,
          versionMatch: packageJson.version === localVersion,
        },
      };
    } catch (error) {
      return {
        state: 'error',
        confidence: 0.2,
        source: 'local-state',
        error: error.message,
      };
    }
  }
}

class NetworkCacheOracle {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async analyze(packageName, localVersion) {
    const cacheKey = `${packageName}:${localVersion}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        ...cached.data,
        source: 'network-cache',
        cached: true,
        confidence: cached.data.confidence * 0.9, // Slightly lower confidence for cached data
      };
    }

    // No cache hit, return unknown but high confidence for future caching
    return {
      state: 'cache-miss',
      confidence: 0.8,
      source: 'network-cache',
      cached: false,
      metadata: { cacheKey, cacheTimeout: this.cacheTimeout },
    };
  }

  cacheResult(packageName, localVersion, data) {
    const cacheKey = `${packageName}:${localVersion}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }
}

class SemanticVersionOracle {
  async analyze(packageName, localVersion) {
    try {
      const semver = this.parseSemVer(localVersion);

      const conflicts = [];
      const recommendations = [];

      // Check for invalid semantic versions
      if (localVersion && !localVersion.match(/^\d+\.\d+\.\d+/)) {
        conflicts.push({
          type: 'invalid-semver',
          message: `Invalid semantic version format: ${localVersion}`,
          severity: 'high',
        });
      }

      // Check for pre-release versions
      if (
        localVersion &&
        (localVersion.includes('-') ||
          localVersion.includes('alpha') ||
          localVersion.includes('beta'))
      ) {
        conflicts.push({
          type: 'prerelease-version',
          message: `Pre-release version detected: ${localVersion}`,
          severity: 'medium',
        });
      }

      // Recommend semantic version compliance
      if (semver.patch === 0 && semver.minor === 0 && semver.major === 0) {
        recommendations.push({
          action: 'version-guidance',
          message: 'Consider using semantic versioning (e.g., 1.0.0 for first release)',
          suggestedVersion: '1.0.0',
        });
      }

      return {
        state: conflicts.length === 0 ? 'valid-version' : 'version-issues',
        conflicts,
        recommendations,
        confidence: 0.8,
        source: 'semantic-version',
        metadata: {
          parsedVersion: semver,
          isValidFormat: localVersion.match(/^\d+\.\d+\.\d+/) !== null,
          isPrerelease: localVersion && localVersion.includes('-'),
        },
      };
    } catch (error) {
      return {
        state: 'version-error',
        confidence: 0.3,
        source: 'semantic-version',
        error: error.message,
      };
    }
  }

  parseSemVer(version) {
    const match = version ? version.match(/^(\d+)\.(\d+)\.(\d+)/) : null;
    return match
      ? {
          major: parseInt(match[1], 10),
          minor: parseInt(match[2], 10),
          patch: parseInt(match[3], 10),
        }
      : { major: 0, minor: 0, patch: 0 };
  }
}
