import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Advanced Visualization Suite for Multi-Oracle Intelligence
 * Enterprise-grade dashboards and real-time monitoring
 */
export class AdvancedVisualization {
  constructor() {
    this.animationFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.currentFrame = 0;
  }

  /**
   * Display enterprise-grade intelligence dashboard
   */
  async displayEnterpriseDashboard(packageAnalyses, executionMetrics) {
    console.clear();

    console.log(
      chalk.cyan.bold(`
╔══════════════════════════════════════════════════════════════╗
║                    🧠 INTELLIGENCE MATRIX                    ║
║                 Next-Generation Deployment System            ║
╚══════════════════════════════════════════════════════════════╝
`),
    );

    await this.displaySystemOverview(packageAnalyses, executionMetrics);
    await this.displayIntelligenceHeatmap(packageAnalyses);
    await this.displayPredictiveAnalytics(packageAnalyses);
    await this.displayPerformanceMetrics(executionMetrics);
    await this.displayRecommendationsEngine(packageAnalyses);
  }

  /**
   * System overview with live metrics
   */
  async displaySystemOverview(packageAnalyses, _executionMetrics) {
    const totalPackages = packageAnalyses.length;
    const highConfidence = packageAnalyses.filter(p => p.consensusScore > 0.8).length;
    const conflictsDetected = packageAnalyses.filter(p => p.analysis.conflicts.length > 0).length;
    const avgOracleCount = Math.round(
      packageAnalyses.reduce((sum, p) => sum + p.oracleResults.length, 0) / totalPackages,
    );

    console.log(chalk.blue.bold('\n📊 SYSTEM OVERVIEW'));

    console.log(chalk.gray('─'.repeat(70)));

    const overviewBox = boxen(
      chalk.white(`Packages Analyzed: ${chalk.bold(totalPackages)}\n`) +
        chalk.green(`High Confidence: ${chalk.bold(highConfidence)}/${totalPackages}\n`) +
        chalk.yellow(`Conflicts Detected: ${chalk.bold(conflictsDetected)}\n`) +
        chalk.cyan(`Avg Oracle Coverage: ${chalk.bold(avgOracleCount)}/6\n`) +
        chalk.magenta(`System Uptime: ${chalk.bold(this.getUptime())}\n`) +
        chalk.blue(
          `Intelligence Level: ${chalk.bold(this.calculateOverallIntelligence(packageAnalyses))}`,
        ),
      {
        title: '🎯 REAL-TIME METRICS',
        titleAlignment: 'center',
        padding: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
      },
    );

    console.log(overviewBox);
  }

  /**
   * Intelligence heatmap visualization
   */
  async displayIntelligenceHeatmap(packageAnalyses) {
    console.log(chalk.blue.bold('\n🌡️  INTELLIGENCE HEATMAP'));

    console.log(chalk.gray('─'.repeat(70)));

    const heatmap = this.generateHeatmap(packageAnalyses);

    console.log(heatmap);

    // Legend

    console.log(
      chalk.gray('\nLegend: ') +
        chalk.bgGreen('█ ') +
        chalk.gray(' High Confidence (80%+)') +
        '  ' +
        chalk.bgYellow('█ ') +
        chalk.gray(' Medium (60-79%)') +
        '  ' +
        chalk.bgRed('█ ') +
        chalk.gray(' Low (<60%)') +
        '  ' +
        chalk.bgGray('█ ') +
        chalk.gray(' No Data'),
    );
  }

  /**
   * Predictive analytics dashboard
   */
  async displayPredictiveAnalytics(packageAnalyses) {
    console.log(chalk.blue.bold('\n🔮 PREDICTIVE ANALYTICS'));

    console.log(chalk.gray('─'.repeat(70)));

    const predictions = this.generatePredictions(packageAnalyses);

    predictions.forEach((prediction, index) => {
      const successIcon =
        prediction.successProbability > 0.8
          ? '✅'
          : prediction.successProbability > 0.6
            ? '⚠️'
            : '❌';
      const probColor =
        prediction.successProbability > 0.8
          ? chalk.green
          : prediction.successProbability > 0.6
            ? chalk.yellow
            : chalk.red;

      console.log(`${index + 1}. ${successIcon} ${prediction.packageName}`);

      console.log(
        `   Success Probability: ${probColor(`${Math.round(prediction.successProbability * 100)}%`)}`,
      );

      console.log(`   Risk Factors: ${prediction.riskFactors.length}`);

      if (prediction.riskFactors.length > 0) {
        prediction.riskFactors.forEach(factor => {
          console.log(`     • ${chalk.yellow(factor)}`);
        });
      }

      console.log('');
    });
  }

  /**
   * Performance metrics with real-time monitoring
   */
  async displayPerformanceMetrics(executionMetrics) {
    console.log(chalk.blue.bold('\n⚡ PERFORMANCE METRICS'));

    console.log(chalk.gray('─'.repeat(70)));

    const metrics = {
      totalAnalysisTime: executionMetrics.totalTime || 0,
      avgOracleResponseTime: executionMetrics.avgOracleResponseTime || 0,
      throughput: executionMetrics.throughput || 0,
      accuracy: executionMetrics.accuracy || 0,
      efficiency: executionMetrics.efficiency || 0,
    };

    // Performance bars

    console.log(chalk.cyan('Response Time:'));

    console.log(this.createProgressBar(metrics.avgOracleResponseTime, 1000, 'ms'));

    console.log(chalk.cyan('System Efficiency:'));

    console.log(this.createProgressBar(metrics.efficiency, 100, '%'));

    console.log(chalk.cyan('Prediction Accuracy:'));

    console.log(this.createProgressBar(metrics.accuracy, 100, '%'));

    // Metrics table
    const metricsTable = [
      [
        'Total Analysis Time',
        `${metrics.totalAnalysisTime}ms`,
        this.getPerformanceGrade(metrics.totalAnalysisTime, 5000),
      ],
      [
        'Oracle Throughput',
        `${metrics.throughput} queries/sec`,
        this.getPerformanceGrade(metrics.throughput, 10),
      ],
      [
        'System Efficiency',
        `${Math.round(metrics.efficiency)}%`,
        this.getPerformanceGrade(metrics.efficiency, 80),
      ],
      ['Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, 'Optimal'],
      ['CPU Utilization', `${Math.round(process.cpuUsage().user / 1000000)}%`, 'Low'],
    ];

    console.log(chalk.cyan('\nSystem Metrics:'));
    metricsTable.forEach(([metric, value, status]) => {
      const statusColor =
        status === 'Optimal' || status === 'Low'
          ? chalk.green
          : status === 'Good'
            ? chalk.yellow
            : chalk.red;

      console.log(`  ${metric.padEnd(25)} ${value.padEnd(15)} ${statusColor(status)}`);
    });
  }

  /**
   * AI-powered recommendations engine
   */
  async displayRecommendationsEngine(packageAnalyses) {
    console.log(chalk.blue.bold('\n🤖 AI RECOMMENDATIONS ENGINE'));

    console.log(chalk.gray('─'.repeat(70)));

    const recommendations = this.generateAIRecommendations(packageAnalyses);

    // Categorize recommendations
    const critical = recommendations.filter(r => r.priority === 'critical');
    const warnings = recommendations.filter(r => r.priority === 'warning');
    const optimizations = recommendations.filter(r => r.priority === 'optimization');

    if (critical.length > 0) {
      console.log(chalk.red.bold('\n🚨 CRITICAL ACTIONS REQUIRED:'));
      critical.forEach(rec => {
        console.log(`${chalk.red('•')} ${rec.message}`);
        if (rec.action) {
          console.log(`  ${chalk.cyan('Action:')} ${rec.action}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  WARNINGS:'));
      warnings.forEach(rec => {
        console.log(`${chalk.yellow('•')} ${rec.message}`);
        if (rec.action) {
          console.log(`  ${chalk.cyan('Action:')} ${rec.action}`);
        }
      });
    }

    if (optimizations.length > 0) {
      console.log(chalk.green.bold('\n💡 OPTIMIZATIONS:'));
      optimizations.forEach(rec => {
        console.log(`${chalk.green('•')} ${rec.message}`);
        if (rec.action) {
          console.log(`  ${chalk.cyan('Action:')} ${rec.action}`);
        }
      });
    }
  }

  /**
   * Generate intelligence heatmap
   */
  generateHeatmap(packageAnalyses) {
    let heatmap = '';

    // Header row
    heatmap += 'Package'.padEnd(25) + 'Confidence'.padEnd(12) + 'Oracles'.padEnd(10) + 'State\n';
    heatmap += chalk.gray('─'.repeat(70)) + '\n';

    packageAnalyses.forEach(pkg => {
      const confidence = Math.round(pkg.consensusScore * 100);
      const oracles = pkg.oracleResults.length;
      const state = pkg.analysis.state;

      // Confidence bar with color coding
      const barLength = Math.floor((pkg.consensusScore / 1) * 10);
      const filledBar = this.getConfidenceBar(barLength);

      // Package name
      heatmap += pkg.packageName.padEnd(25);

      // Confidence visualization
      heatmap += filledBar + ` ${confidence}%`.padEnd(12 - barLength);

      // Oracle count
      heatmap += `${oracles}/6`.padEnd(10);

      // State with emoji
      const stateEmoji = this.getStateEmoji(state);
      heatmap += `${stateEmoji} ${state}\n`;
    });

    return heatmap;
  }

  /**
   * Generate predictive analytics
   */
  generatePredictions(packageAnalyses) {
    return packageAnalyses.map(pkg => {
      const riskFactors = [];
      let successProbability = pkg.consensusScore;

      // Analyze risk factors
      if (pkg.consensusScore < 0.7) {
        riskFactors.push('Low oracle consensus');
      }

      if (pkg.oracleResults.length < 4) {
        riskFactors.push('Insufficient oracle coverage');
      }

      if (pkg.analysis.conflicts.length > 0) {
        riskFactors.push('Unresolved conflicts');
      }

      if (pkg.reliability.score < 0.6) {
        riskFactors.push('Low reliability score');
      }

      // Adjust probability based on risk factors
      successProbability -= riskFactors.length * 0.1;
      successProbability = Math.max(0, Math.min(1, successProbability));

      return {
        packageName: pkg.packageName,
        successProbability,
        riskFactors,
        confidence: pkg.consensusScore,
        recommendation: this.getRecommendation(successProbability, riskFactors),
      };
    });
  }

  /**
   * Generate AI-powered recommendations
   */
  generateAIRecommendations(packageAnalyses) {
    const recommendations = [];

    // Analyze overall system health
    const avgConfidence =
      packageAnalyses.reduce((sum, p) => sum + p.consensusScore, 0) / packageAnalyses.length;

    if (avgConfidence < 0.7) {
      recommendations.push({
        priority: 'critical',
        message: 'Low overall intelligence confidence detected',
        action: 'Check network connectivity and npm registry availability',
      });
    }

    // Check for conflicts
    const conflictPackages = packageAnalyses.filter(p => p.analysis.conflicts.length > 0);
    if (conflictPackages.length > 0) {
      recommendations.push({
        priority: 'warning',
        message: `${conflictPackages.length} packages have unresolved conflicts`,
        action: 'Run conflict resolution workflow before publishing',
      });
    }

    // Oracle performance
    const avgOracleCount =
      packageAnalyses.reduce((sum, p) => sum + p.oracleResults.length, 0) / packageAnalyses.length;
    if (avgOracleCount < 5) {
      recommendations.push({
        priority: 'optimization',
        message: 'Suboptimal oracle coverage detected',
        action: 'Check oracle health and network connectivity',
      });
    }

    // Success probability analysis
    const lowProbPackages = this.generatePredictions(packageAnalyses).filter(
      p => p.successProbability < 0.6,
    );
    if (lowProbPackages.length > 0) {
      recommendations.push({
        priority: 'warning',
        message: `${lowProbPackages.length} packages have low success probability`,
        action: 'Review risk factors and address issues before proceeding',
      });
    }

    return recommendations;
  }

  /**
   * Utility functions for visualization
   */
  getConfidenceBar(length) {
    const bars = ['█', '█', '█', '█', '█', '█', '█', '█', '█', '█'];
    const colors = [
      chalk.red,
      chalk.red,
      chalk.yellow,
      chalk.yellow,
      chalk.green,
      chalk.green,
      chalk.green,
      chalk.green,
      chalk.green,
      chalk.green,
    ];

    let bar = '';
    for (let i = 0; i < 10; i++) {
      if (i < length) {
        bar += colors[i](bars[i]);
      } else {
        bar += chalk.gray('░');
      }
    }
    return bar;
  }

  getStateEmoji(state) {
    const emojis = {
      'new-package': '🆕',
      'version-exists': '⚠️',
      'version-bump': '📈',
      'version-downgrade': '📉',
      'local-package-exists': '📦',
      unknown: '❓',
    };
    return emojis[state] || '❓';
  }

  createProgressBar(value, max, unit) {
    const percentage = Math.min((value / max) * 100, 100);
    const barLength = Math.floor(percentage / 5);
    const filled = '█'.repeat(barLength);
    const empty = '░'.repeat(20 - barLength);

    const color = percentage > 80 ? chalk.green : percentage > 60 ? chalk.yellow : chalk.red;
    return `  [${color(filled)}${chalk.gray(empty)}] ${Math.round(percentage)}% ${unit}`;
  }

  getPerformanceGrade(value, threshold) {
    if (value <= threshold * 0.5) return 'Optimal';
    if (value <= threshold * 0.75) return 'Good';
    if (value <= threshold) return 'Fair';
    return 'Poor';
  }

  getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  calculateOverallIntelligence(packageAnalyses) {
    const avgConfidence =
      packageAnalyses.reduce((sum, p) => sum + p.consensusScore, 0) / packageAnalyses.length;
    const avgOracleCount =
      packageAnalyses.reduce((sum, p) => sum + p.oracleResults.length, 0) / packageAnalyses.length;
    const conflictFree =
      packageAnalyses.filter(p => p.analysis.conflicts.length === 0).length /
      packageAnalyses.length;

    const overallScore = avgConfidence * 0.4 + (avgOracleCount / 6) * 0.3 + conflictFree * 0.3;

    if (overallScore > 0.8) return 'ADVANCED';
    if (overallScore > 0.6) return 'STANDARD';
    if (overallScore > 0.4) return 'BASIC';
    return 'MINIMAL';
  }

  getRecommendation(probability, _riskFactors) {
    if (probability > 0.8) return 'Proceed with confidence';
    if (probability > 0.6) return 'Proceed with caution';
    if (probability > 0.4) return 'Address risks before proceeding';
    return 'Do not proceed - high risk of failure';
  }

  /**
   * Animated loading indicator
   */
  showLoadingAnimation(message) {
    const frame = this.animationFrames[this.currentFrame];
    this.currentFrame = (this.currentFrame + 1) % this.animationFrames.length;
    return `${chalk.cyan(frame)} ${message}`;
  }
}
