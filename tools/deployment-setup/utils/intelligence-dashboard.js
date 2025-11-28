import chalk from 'chalk';
import ora from 'ora';

/**
 * Intelligence Dashboard for Multi-Oracle Analysis Visualization
 * Provides comprehensive visualization of intelligence sources and consensus
 */
export class IntelligenceDashboard {
  constructor() {
    this.spinner = ora();
  }

  /**
   * Display comprehensive intelligence analysis
   */
  async displayIntelligenceAnalysis(packageAnalyses) {
    console.log(chalk.blue.bold('\n🧠 Multi-Oracle Intelligence Analysis'));

    console.log(chalk.gray('─'.repeat(60)));

    for (const analysis of packageAnalyses) {
      await this.displayPackageIntelligence(analysis);
    }

    await this.displayConsensusSummary(packageAnalyses);
    await this.displayIntelligenceMetrics(packageAnalyses);
  }

  /**
   * Display intelligence for a single package
   */
  async displayPackageIntelligence(analysis) {
    const {
      packageName,
      localVersion,
      analysis: pkgAnalysis,
      _oracleResults,
      consensusScore,
      reliability,
    } = analysis;

    console.log(chalk.bold(`\n📦 ${packageName}@${localVersion}`));

    console.log(chalk.gray('─'.repeat(40)));

    // Display consensus result with confidence
    this.displayConsensusResult(pkgAnalysis, consensusScore);

    // Display oracle agreement
    this.displayOracleAgreement(pkgAnalysis);

    // Display conflicts with corroboration
    this.displayConflicts(pkgAnalysis.conflicts);

    // Display oracle source breakdown
    this.displayOracleBreakdown(_oracleResults);

    // Display reliability metrics
    this.displayReliabilityMetrics(reliability);
  }

  /**
   * Display consensus result with visual indicators
   */
  displayConsensusResult(pkgAnalysis, _consensusScore) {
    const { state, confidence, oracleAgreement } = pkgAnalysis;

    let stateIcon, stateColor, statusText;

    switch (state) {
      case 'new-package':
        stateIcon = '🆕';
        stateColor = chalk.green;
        statusText = 'New Package (Safe to Publish)';
        break;
      case 'version-exists':
        stateIcon = '⚠️';
        stateColor = chalk.yellow;
        statusText = 'Version Conflict Detected';
        break;
      case 'version-bump':
        stateIcon = '📈';
        stateColor = chalk.blue;
        statusText = 'Version Upgrade';
        break;
      default:
        stateIcon = '❓';
        stateColor = chalk.gray;
        statusText = 'Unknown State';
    }

    console.log(`${stateIcon} ${stateColor.bold(statusText)}`);

    console.log(
      `   Confidence: ${this.getConfidenceBar(confidence)} ${Math.round(confidence * 100)}%`,
    );

    console.log(`   Oracle Agreement: ${Math.round(oracleAgreement)}%`);

    if (pkgAnalysis.publishedVersions.length > 0) {
      console.log(
        `   Published Versions: ${pkgAnalysis.publishedVersions.slice(0, 5).join(', ')}${pkgAnalysis.publishedVersions.length > 5 ? '...' : ''}`,
      );
    }
  }

  /**
   * Display oracle agreement visualization
   */
  displayOracleAgreement(pkgAnalysis) {
    console.log(chalk.blue('\n🤖 Oracle Consensus:'));

    // Create visual agreement bar
    const agreementPercentage = pkgAnalysis.oracleAgreement;
    const barLength = 30;
    const filledLength = Math.round((agreementPercentage / 100) * barLength);

    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(barLength - filledLength);

    let barColor;
    if (agreementPercentage >= 80) {
      barColor = chalk.green;
    } else if (agreementPercentage >= 60) {
      barColor = chalk.yellow;
    } else {
      barColor = chalk.red;
    }

    console.log(`   ${barColor(filledBar)}${chalk.gray(emptyBar)} ${agreementPercentage}%`);

    // Display intelligence level
    const intelligenceLevel = pkgAnalysis.intelligenceLevel;
    const levelColors = {
      advanced: chalk.green,
      standard: chalk.blue,
      basic: chalk.yellow,
      minimal: chalk.red,
    };

    console.log(
      `   Intelligence Level: ${levelColors[intelligenceLevel]?.(intelligenceLevel.toUpperCase()) || intelligenceLevel}`,
    );
  }

  /**
   * Display conflicts with corroboration information
   */
  displayConflicts(conflicts) {
    if (conflicts.length === 0) {
      console.log(chalk.green('\n✅ No conflicts detected'));
      return;
    }

    console.log(chalk.yellow('\n⚠️  Conflicts Detected:'));

    conflicts.forEach((conflict, index) => {
      const severityIcon = conflict.severity === 'high' ? '🚨' : '⚠️';
      const corroborationIcon = conflict.corroborated ? '🔗' : '📝';
      const severityColor = conflict.severity === 'high' ? chalk.red : chalk.yellow;

      console.log(`   ${index + 1}. ${severityIcon} ${severityColor(conflict.message)}`);

      if (conflict.corroborated) {
        console.log(
          `      ${corroborationIcon} Corroborated by ${conflict.sourceCount} intelligence sources`,
        );
      }

      if (conflict.suggestedVersion) {
        console.log(`      💡 Suggested: ${conflict.suggestedVersion}`);
      }
    });
  }

  /**
   * Display oracle source breakdown
   */
  displayOracleBreakdown(oracleResults) {
    console.log(chalk.blue('\n📡 Intelligence Sources:'));

    oracleResults.forEach((result, index) => {
      const statusIcon = result.success ? '✅' : '❌';
      const statusColor = result.success ? chalk.green : chalk.red;

      console.log(`   ${index + 1}. ${statusIcon} ${result.oracle}:`);

      console.log(`      Response: ${statusColor(result.success ? 'Success' : 'Failed')}`);

      if (result.success) {
        const confidenceBar = this.getConfidenceBar(result.confidence);

        console.log(
          `      Confidence: ${confidenceBar} ${Math.round((result.confidence || 0.8) * 100)}%`,
        );

        if (result.result && result.result.state) {
          console.log(`      State: ${result.result.state}`);
        }
      } else {
        console.log(`      Error: ${chalk.gray(result.error || 'Unknown error')}`);
      }

      if (result.responseTime) {
        console.log(`      Response Time: ${result.responseTime}ms`);
      }
    });
  }

  /**
   * Display reliability metrics
   */
  displayReliabilityMetrics(reliability) {
    console.log(chalk.blue('\n📊 Reliability Metrics:'));

    let scoreColor;
    if (reliability.score > 0.8) {
      scoreColor = chalk.green;
    } else if (reliability.score > 0.6) {
      scoreColor = chalk.yellow;
    } else {
      scoreColor = chalk.red;
    }

    console.log(`   Overall Score: ${scoreColor(Math.round(reliability.score * 100))}%`);

    console.log(`   Sources Active: ${reliability.sourceCount}/${6} oracles`);

    console.log(`   Average Confidence: ${Math.round(reliability.avgConfidence * 100)}%`);

    console.log(`   Reliability: ${reliability.reliability.toUpperCase()}`);

    if (reliability.hasHighConfidence) {
      console.log(chalk.green('   ✅ High-confidence sources available'));
    }
  }

  /**
   * Display consensus summary across all packages
   */
  async displayConsensusSummary(packageAnalyses) {
    console.log(chalk.blue.bold('\n🎯 Overall Consensus Summary'));

    console.log(chalk.gray('─'.repeat(60)));

    const totalPackages = packageAnalyses.length;
    const highConfidencePackages = packageAnalyses.filter(p => p.consensusScore > 0.8).length;
    const conflictPackages = packageAnalyses.filter(p => p.analysis.conflicts.length > 0).length;
    const readyPackages = packageAnalyses.filter(p => p.analysis.conflicts.length === 0).length;

    console.log(`📦 Total Packages Analyzed: ${totalPackages}`);

    console.log(chalk.green(`✅ High Confidence: ${highConfidencePackages}/${totalPackages}`));

    console.log(chalk.yellow(`⚠️  Conflicts Detected: ${conflictPackages}/${totalPackages}`));

    console.log(chalk.green(`🚀 Ready to Publish: ${readyPackages}/${totalPackages}`));

    // Calculate overall intelligence score
    const avgConsensus =
      packageAnalyses.reduce((sum, p) => sum + p.consensusScore, 0) / totalPackages;
    const avgReliability =
      packageAnalyses.reduce((sum, p) => sum + p.reliability.score, 0) / totalPackages;

    console.log(chalk.blue(`\n📈 Performance Metrics:`));

    console.log(`   Average Consensus: ${Math.round(avgConsensus * 100)}%`);

    console.log(`   Average Reliability: ${Math.round(avgReliability * 100)}%`);

    // Display intelligence effectiveness
    const effectiveness = this.calculateIntelligenceEffectiveness(packageAnalyses);
    let effectivenessColor;
    if (effectiveness > 0.9) {
      effectivenessColor = chalk.green;
    } else if (effectiveness > 0.7) {
      effectivenessColor = chalk.yellow;
    } else {
      effectivenessColor = chalk.red;
    }

    console.log(
      `   Intelligence Effectiveness: ${effectivenessColor(Math.round(effectiveness * 100))}%`,
    );
  }

  /**
   * Display detailed intelligence metrics
   */
  async displayIntelligenceMetrics(packageAnalyses) {
    console.log(chalk.blue.bold('\n🔍 Detailed Intelligence Metrics'));

    console.log(chalk.gray('─'.repeat(60)));

    // Oracle performance analysis
    const oracleMetrics = this.calculateOracleMetrics(packageAnalyses);

    console.log(chalk.blue('\n🤖 Oracle Performance:'));

    Object.entries(oracleMetrics).forEach(([oracle, metrics]) => {
      const successRate = Math.round((metrics.successful / metrics.total) * 100);
      const avgResponseTime = Math.round(
        metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length,
      );
      let statusColor;
      if (successRate >= 80) {
        statusColor = chalk.green;
      } else if (successRate >= 60) {
        statusColor = chalk.yellow;
      } else {
        statusColor = chalk.red;
      }

      console.log(`   ${oracle}:`);

      console.log(
        `     Success Rate: ${statusColor(`${successRate}%`)} (${metrics.successful}/${metrics.total})`,
      );

      console.log(`     Avg Response: ${avgResponseTime}ms`);

      console.log(`     Avg Confidence: ${Math.round(metrics.avgConfidence * 100)}%`);
    });

    // Conflict analysis
    const conflictAnalysis = this.analyzeConflicts(packageAnalyses);

    console.log(chalk.blue('\n⚠️  Conflict Analysis:'));

    console.log(`   Total Conflicts: ${conflictAnalysis.total}`);

    console.log(`   High Severity: ${chalk.red(conflictAnalysis.highSeverity)}`);

    console.log(`   Medium Severity: ${chalk.yellow(conflictAnalysis.mediumSeverity)}`);

    console.log(
      `   Corroborated: ${conflictAnalysis.corroborated} (${Math.round((conflictAnalysis.corroborated / conflictAnalysis.total) * 100)}%)`,
    );
  }

  /**
   * Generate confidence visualization bar
   */
  getConfidenceBar(confidence) {
    const barLength = 10;
    const filledLength = Math.round(confidence * barLength);
    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(barLength - filledLength);

    let color;
    if (confidence >= 0.8) {
      color = chalk.green;
    } else if (confidence >= 0.6) {
      color = chalk.yellow;
    } else {
      color = chalk.red;
    }
    return color(filledBar) + chalk.gray(emptyBar);
  }

  /**
   * Calculate overall intelligence effectiveness
   */
  calculateIntelligenceEffectiveness(packageAnalyses) {
    if (packageAnalyses.length === 0) return 0;

    const totalOracles = 6; // Total number of available oracles
    const activeOracles = packageAnalyses.reduce((sum, p) => sum + p.oracleResults.length, 0);
    const avgConfidence =
      packageAnalyses.reduce((sum, p) => sum + p.consensusScore, 0) / packageAnalyses.length;
    const consensusAgreement =
      packageAnalyses.reduce((sum, p) => sum + p.analysis.oracleAgreement, 0) /
      packageAnalyses.length /
      100;

    const oracleCoverage = Math.min(activeOracles / (packageAnalyses.length * totalOracles), 1);

    return oracleCoverage * 0.4 + avgConfidence * 0.3 + consensusAgreement * 0.3;
  }

  /**
   * Calculate oracle performance metrics
   */
  calculateOracleMetrics(packageAnalyses) {
    const metrics = {};

    packageAnalyses.forEach(analysis => {
      analysis.oracleResults.forEach(result => {
        if (!metrics[result.oracle]) {
          metrics[result.oracle] = {
            total: 0,
            successful: 0,
            responseTimes: [],
            avgConfidence: 0,
          };
        }

        const oracleMetrics = metrics[result.oracle];
        oracleMetrics.total++;
        oracleMetrics.responseTimes.push(result.responseTime || 0);

        if (result.success) {
          oracleMetrics.successful++;
          oracleMetrics.avgConfidence += result.confidence || 0.8;
        }
      });
    });

    // Calculate averages
    Object.values(metrics).forEach(oracle => {
      if (oracle.successful > 0) {
        oracle.avgConfidence = oracle.avgConfidence / oracle.successful;
      }
    });

    return metrics;
  }

  /**
   * Analyze conflicts across all packages
   */
  analyzeConflicts(packageAnalyses) {
    const analysis = {
      total: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      corroborated: 0,
    };

    packageAnalyses.forEach(pkgAnalysis => {
      pkgAnalysis.analysis.conflicts.forEach(conflict => {
        analysis.total++;

        if (conflict.severity === 'high') {
          analysis.highSeverity++;
        } else if (conflict.severity === 'medium') {
          analysis.mediumSeverity++;
        }

        if (conflict.corroborated) {
          analysis.corroborated++;
        }
      });
    });

    return analysis;
  }

  /**
   * Display intelligence recommendations
   */
  displayIntelligenceRecommendations(packageAnalyses) {
    const recommendations = [];

    packageAnalyses.forEach(analysis => {
      analysis.analysis.recommendations.forEach(rec => {
        recommendations.push({
          ...rec,
          packageName: analysis.packageName,
        });
      });
    });

    if (recommendations.length === 0) {
      console.log(chalk.green('\n✨ No recommendations - Everything looks great!'));
      return;
    }

    console.log(chalk.blue.bold('\n💡 Intelligence Recommendations:'));

    console.log(chalk.gray('─'.repeat(60)));

    recommendations.forEach((rec, index) => {
      const icon = rec.autoResolvable ? '🤖' : '🔧';
      const color = rec.autoResolvable ? chalk.green : chalk.yellow;

      console.log(`${index + 1}. ${icon} ${color(`[${rec.packageName}]`)} ${rec.message}`);

      if (rec.confidence) {
        console.log(`   Confidence: ${Math.round(rec.confidence * 100)}%`);
      }

      if (rec.suggestedVersion) {
        console.log(`   Suggested Version: ${rec.suggestedVersion}`);
      }

      if (rec.corroboratedBy) {
        console.log(`   Corroborated by: ${rec.corroboratedBy} oracles`);
      }
    });
  }

  /**
   * Display real-time analysis progress
   */
  async displayAnalysisProgress(packageAnalyses) {
    this.spinner.start('Analyzing packages with multi-source intelligence...');

    for (let i = 0; i < packageAnalyses.length; i++) {
      const analysis = packageAnalyses[i];
      this.spinner.text = `Analyzing ${analysis.packageName} with ${analysis.oracleResults.length} oracles...`;

      // Simulate progress
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.spinner.succeed('Multi-oracle analysis completed');
  }
}
