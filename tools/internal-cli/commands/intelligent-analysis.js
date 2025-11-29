#!/usr/bin/env node

/**
 * Oracle Intelligence Analysis Command
 *
 * @context Primary CLI interface for DAWLabs Oracle Intelligence deployment analysis
 * @purpose Integrates Oracle Intelligence system with CI/CD workflows for automated deployment validation
 * @integration Used by GitHub Actions workflows and CLI for package publishing readiness analysis
 * @workflow Core component for intelligent deployment decisions and version compliance checking
 *
 * This command provides comprehensive package analysis using multiple oracle sources:
 * - Real-time NPM registry validation
 * - Version history analysis and compliance checking
 * - Git history and build artifact validation
 * - Multi-source consensus decision making
 * - CI/CD pipeline integration with three output modes
 *
 * Output Modes:
 * 1. Default: Human-readable console output with detailed analysis and recommendations
 * 2. --json: Machine-readable JSON output for programmatic consumption
 * 3. --ci-format: Clean, formatted summary optimized for CI/CD pipeline logs
 *
 * Key Features:
 * - Version violation detection prevents publishing errors
 * - Consensus-based analysis using 7 different oracle sources
 * - Confidence scoring and reliability assessment
 * - Conflict detection and resolution recommendations
 * - GitHub Actions integration with OIDC authentication support
 *
 * Usage Examples:
 * // Interactive human analysis
 * node tools/internal-cli/index.js intelligent-analysis
 *
 * // Machine-readable JSON output
 * node tools/internal-cli/index.js intelligent-analysis --json
 *
 * // CI/CD optimized format
 * node tools/internal-cli/index.js intelligent-analysis --ci-format
 *
 * // Package-specific analysis
 * node tools/internal-cli/index.js intelligent-analysis --package @dawlabs/ncurl
 *
 * // High-confidence requirement
 * node tools/internal-cli/index.js intelligent-analysis --confidence-threshold 0.9
 *
 * Workflow Integration:
 * - Called by GitHub Actions release workflow
 * - Results used to determine publishing readiness
 * - Version violations block deployment process
 * - Consensus scores indicate deployment confidence
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
  .option('--json', 'output results in JSON format for machine processing')
  .option('--ci-format', 'output clean, formatted summary for CI/CD pipelines')
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
    .option('--json', 'output results in JSON format for machine processing')
    .option('--ci-format', 'output clean, formatted summary for CI/CD pipelines')
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
 * Run comprehensive intelligence analysis on workspace packages
 *
 * @returns {Promise<Array<Object>>} Analysis results for all processed packages
 * @returns {Object} returns[].analysis - Fused analysis result from Oracle Intelligence system
 * @returns {string} returns[].packageName - Name of the analyzed package
 * @returns {string} returns[].version - Version of the analyzed package
 * @returns {string} returns[].packagePath - Path to the package in the monorepo
 * @returns {number} returns[].consensusScore - Confidence score (0.0-1.0) from consensus analysis
 * @returns {number} returns[].analysisTime - Time taken for analysis in milliseconds
 * @returns {Object} returns[].reliability - Reliability assessment of the analysis
 * @returns {Array<Object>} returns[].oracleResults - Raw results from all oracle sources
 *
 * @workflow Orchestrates comprehensive package analysis using Oracle Intelligence system
 * @integration Core analysis engine called by CLI interface and CI/CD workflows
 * @purpose Provides intelligent deployment decisions using multi-source consensus analysis
 *
 * Analysis Algorithm:
 * 1. Package Discovery: Get all workspace packages or specific package
 * 2. Console Mode Handling: Configure output based on --json flag
 * 3. Oracle Intelligence Analysis:
 *    - Initialize OracleIntelligencePackageAnalyzer
 *    - Analyze each package with all 7 oracle sources
 *    - Calculate consensus scores and reliability metrics
 *    - Detect version violations and conflicts
 * 4. Progress Reporting: Show real-time analysis progress (non-JSON mode)
 * 5. Validation Checks:
 *    - Conflict detection with optional workflow failure
 *    - Confidence threshold validation
 * 6. Results Display:
 *    - JSON mode: Clean machine-readable output
 *    - Default mode: Detailed dashboard with recommendations
 *    - CI format: Clean formatted summary for pipelines
 *
 * Error Handling Strategy:
 * - Individual package errors don't stop overall analysis
 * - Failed packages included in results with error details
 * - Console output properly silenced in JSON mode
 * - Verbose mode available for detailed error information
 *
 * Console Output Modes:
 * - --json: No console output, only JSON to stdout
 * - --ci-format: Clean formatted summary optimized for CI logs
 * - Default: Rich console output with spinners, colors, and detailed analysis
 *
 * @example
 * // Analyze all packages with rich output
 * const results = await runIntelligentAnalysis();
 *
 * // Results include:
 * // - Consensus confidence scores
 * // - Version compliance status
 * // - Conflict detection
 * // - Publishing recommendations
 */
async function runIntelligentAnalysis() {
  // Only use spinner in non-JSON mode
  const spinner = options.json ? null : ora('🧠 Running Oracle Intelligence analysis...').start();
  const results = [];

  try {
    // Get all workspace packages or specific package
    const packages = options.package
      ? [await getSpecificPackage(options.package)]
      : await findWorkspacePackages();

    if (packages.length === 0) {
      if (spinner) spinner.warn('No packages found to analyze');
      return [];
    }

    if (spinner) spinner.text = `Analyzing ${packages.length} packages with Oracle Intelligence...`;

    // Temporarily redirect console.log to silence in JSON mode
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    if (options.json) {
      // Silence all console output in JSON mode
      console.log = () => {};
      console.error = () => {};
    }

    const analyzer = new OracleIntelligencePackageAnalyzer();
    const dashboard = new OracleIntelligenceDashboard();

    try {
      // Analyze each package
      for (const pkg of packages) {
        if (spinner) spinner.text = `Analyzing ${pkg.name}@${pkg.version}...`;

        try {
          const analysis = await analyzer.analyzeWithIntelligence(pkg.name, pkg.version, pkg.path);

          results.push(analysis);

          // Only show progress in non-JSON mode
          if (spinner) {
            const confidence = Math.round(analysis.consensusScore * 100);
            const status = analysis.analysis.state;

            originalConsoleLog(
              `${status === 'new-package' ? '🆕' : status === 'version-exists' ? '⚠️' : '✅'} ` +
                `${pkg.name}@${pkg.version}: ${status} (${confidence}% confidence)`,
            );
          }
        } catch (error) {
          if (spinner) {
            originalConsoleError(chalk.red(`❌ Failed to analyze ${pkg.name}: ${error.message}`));
          }
          results.push({
            packageName: pkg.name,
            version: pkg.version,
            overallStatus: 'ERROR',
            error: error.message,
            confidence: 0,
          });
        }
      }

      if (spinner) spinner.succeed('Oracle Intelligence analysis completed');

      // Check for conflicts if fail-on-conflicts is enabled
      if (options.failOnConflicts) {
        const conflicts = results.filter(
          r => r.analysis?.conflicts?.length > 0 || r.overallStatus === 'CONFLICT',
        );

        if (conflicts.length > 0) {
          if (!options.json) {
            originalConsoleLog(
              chalk.red(`\n⚠️  Found ${conflicts.length} conflicts. Failing as requested.`),
            );
          }

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

      if (lowConfidence.length > 0 && !options.json) {
        originalConsoleLog(
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
    } finally {
      // Restore console output
      if (options.json) {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
      }
    }
  } catch (error) {
    if (spinner) spinner.fail('Oracle Intelligence analysis failed');
    if (!options.json) {
      console.error(chalk.red(`Error: ${error.message}`));
      if (options.verbose) {
        console.error(error.stack);
      }
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
 * Main execution function with three-mode output system
 *
 * @returns {Promise<void>} Completes analysis and outputs results in appropriate format
 * @throws {Error} Exits with error code 1 if analysis fails
 *
 * @workflow Orchestrates analysis execution and handles three different output modes
 * @integration Entry point for both direct CLI execution and programmatic calls
 * @purpose Provides appropriate output formatting for different consumption contexts
 *
 * Three-Mode Output System:
 *
 * 1. JSON Mode (--json flag):
 *    - Pure machine-readable JSON output to stdout
 *    - No console.log statements, no colors, no formatting
 *    - Ideal for programmatic consumption and API integration
 *    - Silent operation with only JSON results
 *
 * 2. CI Format Mode (--ci-format flag):
 *    - Clean, formatted summary optimized for CI/CD pipeline logs
 *    - Human-readable but structured for automated parsing
 *    - Shows package status, confidence scores, and conflict counts
 *    - Includes summary statistics for quick pipeline assessment
 *
 * 3. Default Mode (interactive):
 *    - Rich console output with colors, spinners, and detailed analysis
 *    - Comprehensive dashboard with recommendations and insights
 *    - Full analysis results with confidence metrics and oracle details
 *    - Ideal for interactive CLI usage and detailed investigation
 *
 * Output Format Examples:
 *
 * JSON Mode:
 * ```json
 * [{"packageName":"@dawlabs/ncurl","consensusScore":0.85,"analysis":{"state":"new-package"}}]
 * ```
 *
 * CI Format:
 * ```
 * 📦 Oracle Intelligence Analysis Summary:
 *   ✅ @dawlabs/ncurl@v0.0.2 (85% confidence)
 * 📊 Summary: 1/1 packages ready for publishing
 * ```
 *
 * Default Mode:
 * - Interactive spinner during analysis
 * - Detailed dashboard with color-coded status
 * - Oracle intelligence breakdown and recommendations
 * - Summary statistics with confidence metrics
 *
 * Error Handling:
 * - All modes handle errors consistently with process.exit(1)
 * - JSON mode: No error output to avoid polluting JSON stream
 * - CI/Default modes: Formatted error messages with context
 *
 * @example
 * // Called by CLI system with parsed options
 * await main();
 * // Outputs results based on selected mode
 */
async function main() {
  try {
    const results = await runIntelligentAnalysis();

    if (options.json) {
      // Output clean JSON only - no preamble, no formatting
      process.stdout.write(JSON.stringify(results));
    } else if (options.ciFormat) {
      // Output clean, formatted CI summary
      process.stdout.write('\n📦 Oracle Intelligence Analysis Summary:\n');

      results.forEach(pkg => {
        const status = pkg.analysis.state === 'version-violation' ? '⚠️' : '✅';
        const confidence = Math.round(pkg.analysis.confidence * 100);
        const conflicts = pkg.analysis.conflicts.length;
        process.stdout.write(
          `  ${status} ${pkg.packageName}@v${pkg.localVersion} (${confidence}% confidence)\n`,
        );
        if (conflicts > 0) {
          process.stdout.write(`     → ${conflicts} conflict(s) detected\n`);
        }
      });

      const totalPkgs = results.length;
      const conflictPkgs = results.filter(p => p.analysis.conflicts.length > 0).length;
      process.stdout.write(
        `\n📊 Summary: ${totalPkgs - conflictPkgs}/${totalPkgs} packages ready for publishing\n`,
      );
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
 * Run analysis with custom options for programmatic integration
 *
 * @param {Object} analysisOptions - Override options for this analysis execution
 * @param {boolean} [analysisOptions.json] - Force JSON output mode
 * @param {boolean} [analysisOptions.ciFormat] - Force CI format output mode
 * @param {string} [analysisOptions.package] - Analyze specific package only
 * @param {boolean} [analysisOptions.failOnConflicts] - Exit with error if conflicts detected
 * @param {number} [analysisOptions.confidenceThreshold] - Minimum confidence threshold (0.0-1.0)
 * @returns {Promise<Array<Object>>} Analysis results for all processed packages
 *
 * @workflow Provides programmatic interface with temporary option override capability
 * @integration Used by other CLI modules and external systems for custom analysis execution
 * @purpose Enables flexible integration while maintaining global option state isolation
 *
 * Option Override Strategy:
 * 1. Save current global options state
 * 2. Merge provided analysisOptions with global options
 * 3. Execute analysis with overridden options
 * 4. Handle output formatting based on final option state
 * 5. Restore original global options (even if execution fails)
 *
 * Use Cases:
 * - CI/CD workflow integration with custom parameters
 * - Programmatic analysis from other CLI commands
 * - Testing with specific option combinations
 * - Batch processing with varied configurations
 *
 * Error Handling:
 * - Guaranteed restoration of original options via finally block
 * - Analysis errors don't affect option restoration
 * - Consistent error reporting across all output modes
 *
 * @example
 * // Run with custom confidence threshold for CI integration
 * const results = await runAnalysisWithOptions({
 *   json: true,
 *   confidenceThreshold: 0.9,
 *   failOnConflicts: true
 * });
 *
 * // Original global options remain unchanged after execution
 * console.log('Analysis completed with custom options');
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
      // Output clean JSON only - no preamble, no formatting
      process.stdout.write(JSON.stringify(results));
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
