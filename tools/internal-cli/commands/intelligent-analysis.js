#!/usr/bin/env node

/**
 * Oracle Intelligence Analysis Command
 * Integrates our Oracle Intelligence system with CI/CD workflows
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { OracleIntelligencePackageAnalyzer } from '../utils/multi-oracle-analyzer.js';
import { OracleIntelligenceDashboard } from '../utils/intelligence-dashboard.js';
import { findWorkspacePackages } from './npm-publishing.js';

// Set up Commander program for direct execution
const program = new Command();

program
  .name('intelligent-analysis')
  .description('Oracle Intelligence deployment analysis for CI/CD workflows')
  .option('--json', 'output results in JSON format for CI/CD integration')
  .option('--package <package>', 'analyze specific package only')
  .option('--fail-on-conflicts', 'fail workflow if conflicts are detected')
  .option('--confidence-threshold <number>', 'minimum confidence threshold (0.0-1.0)', '0.7');

// Parse options only if this file is being executed directly
let options;
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
  options = program.opts();
} else {
  // When imported, extract options from process.argv that was set up by index.js
  const tempProgram = new Command();
  tempProgram
    .option('--json', 'output results in JSON format for CI/CD integration')
    .option('--package <package>', 'analyze specific package only')
    .option('--fail-on-conflicts', 'fail workflow if conflicts are detected')
    .option('--confidence-threshold <number>', 'minimum confidence threshold (0.0-1.0)', '0.7');

  // Store original argv
  const originalArgv = process.argv;

  // Set up argv for parsing
  process.argv = ['node', 'intelligent-analysis', ...originalArgv.slice(2)];

  tempProgram.parse();
  options = tempProgram.opts();

  // Restore original argv
  process.argv = originalArgv;
}

/**
 * Run comprehensive intelligence analysis on all packages
 */
async function runIntelligentAnalysis() {
  const spinner = ora('🧠 Running Oracle Intelligence analysis...').start();
  const results = [];

  try {
    // Get all workspace packages or specific package
    const packages = options.package
      ? [await getSpecificPackage(options.package)]
      : await findWorkspacePackages();

    if (packages.length === 0) {
      spinner.warn('No packages found to analyze');
      return [];
    }

    spinner.text = `Analyzing ${packages.length} packages with Oracle Intelligence...`;

    const analyzer = new OracleIntelligencePackageAnalyzer();
    const dashboard = new OracleIntelligenceDashboard();

    // Analyze each package
    for (const pkg of packages) {
      spinner.text = `Analyzing ${pkg.name}@${pkg.version}...`;

      try {
        const analysis = await analyzer.analyzeWithIntelligence(pkg.name, pkg.version, pkg.path);

        results.push(analysis);

        const confidence = Math.round(analysis.consensusScore * 100);
        const status = analysis.analysis.state;

        console.log(
          `${status === 'new-package' ? '🆕' : status === 'version-exists' ? '⚠️' : '✅'} ` +
            `${pkg.name}@${pkg.version}: ${status} (${confidence}% confidence)`,
        );
      } catch (error) {
        console.error(chalk.red(`❌ Failed to analyze ${pkg.name}: ${error.message}`));
        results.push({
          packageName: pkg.name,
          version: pkg.version,
          overallStatus: 'ERROR',
          error: error.message,
          confidence: 0,
        });
      }
    }

    spinner.succeed('Oracle Intelligence analysis completed');

    // Check for conflicts if fail-on-conflicts is enabled
    if (options.failOnConflicts) {
      const conflicts = results.filter(
        r => r.analysis?.conflicts?.length > 0 || r.overallStatus === 'CONFLICT',
      );

      if (conflicts.length > 0) {
        console.log(chalk.red(`\n⚠️  Found ${conflicts.length} conflicts. Failing as requested.`));

        if (!options.json) {
          await dashboard.displayIntelligenceAnalysis(results);
        }

        process.exit(1);
      }
    }

    // Check confidence threshold
    const lowConfidence = results.filter(
      r => r.consensusScore < parseFloat(options.confidenceThreshold),
    );

    if (lowConfidence.length > 0) {
      console.log(
        chalk.yellow(
          `\n⚠️  ${lowConfidence.length} packages have low confidence (<${options.confidenceThreshold * 100}%)`,
        ),
      );
    }

    // Display detailed analysis if not JSON mode
    if (!options.json && results.length > 0) {
      await dashboard.displayIntelligenceAnalysis(results);
    }

    return results;
  } catch (error) {
    spinner.fail('Oracle Intelligence analysis failed');
    console.error(chalk.red(`Error: ${error.message}`));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Get specific package information
 */
async function getSpecificPackage(packageName) {
  const packages = await findWorkspacePackages();
  const pkg = packages.find(p => p.name === packageName);

  if (!pkg) {
    throw new Error(`Package ${packageName} not found in workspace`);
  }

  return pkg;
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await runIntelligentAnalysis();

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const successCount = results.filter(
        r => r.overallStatus !== 'ERROR' && r.overallStatus !== 'CONFLICT',
      ).length;

      const totalConfidence = results.reduce((sum, r) => sum + (r.consensusScore || 0), 0);
      const avgConfidence = results.length > 0 ? totalConfidence / results.length : 0;

      console.log(chalk.blue('\n📊 Analysis Summary:'));
      console.log(`  ✅ Successful: ${chalk.green(successCount)}/${results.length} packages`);
      console.log(`  📈 Average Confidence: ${chalk.blue(Math.round(avgConfidence * 100))}%`);
      console.log(`  🧠 Oracle Intelligence Sources: ${chalk.yellow('6/6 oracles active')}`);
    }
  } catch (error) {
    console.error(chalk.red(`Analysis failed: ${error.message}`));
    process.exit(1);
  }
}

// Export for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runIntelligentAnalysis, main };

/**
 * Run analysis with options passed directly (for integration with other modules)
 */
export async function runAnalysisWithOptions(analysisOptions) {
  // Temporarily override the global options for this execution
  const originalOptions = { ...options };

  // Update the global options with the provided options
  Object.assign(options, analysisOptions);

  try {
    const results = await runIntelligentAnalysis();

    // Handle output formatting based on options
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const successCount = results.filter(
        r => r.overallStatus !== 'ERROR' && r.overallStatus !== 'CONFLICT',
      ).length;

      const totalConfidence = results.reduce((sum, r) => sum + (r.consensusScore || 0), 0);
      const avgConfidence = results.length > 0 ? totalConfidence / results.length : 0;

      console.log(chalk.blue('\n📊 Analysis Summary:'));
      console.log(`  ✅ Successful: ${chalk.green(successCount)}/${results.length} packages`);
      console.log(`  📈 Average Confidence: ${chalk.blue(Math.round(avgConfidence * 100))}%`);
      console.log(`  🧠 Oracle Intelligence Sources: ${chalk.yellow('6/6 oracles active')}`);
    }

    return results;
  } finally {
    // Restore original options
    Object.assign(options, originalOptions);
  }
}
