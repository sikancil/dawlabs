/**
 * Smart Package Analyzer - Intelligent package categorization and analysis
 *
 * Provides comprehensive package analysis including:
 * - Package categorization (new, updated, unchanged)
 * - Date-based sorting (newest changes first)
 * - Version history tracking
 * - Change detection and impact analysis
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';

export class SmartPackageAnalyzer {
  constructor(options = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Analyze all workspace packages with intelligent categorization
   */
  async analyzeWorkspacePackages() {
    console.log(chalk.blue('🧠 Analyzing workspace packages with intelligent categorization...\n'));

    try {
      // Step 1: Get all workspace packages
      const packages = await this.getWorkspacePackages();

      // Step 2: Analyze each package
      const analyzedPackages = [];
      for (const pkg of packages) {
        const analysis = await this.analyzePackage(pkg);
        analyzedPackages.push(analysis);
      }

      // Step 3: Sort packages by change date (newest first)
      analyzedPackages.sort((a, b) => {
        // Priority: new packages > updated packages > unchanged packages
        const priorityScore = {
          'new-package': 3,
          'updated-package': 2,
          'unchanged-package': 1,
          unknown: 0,
        };

        const aPriority = priorityScore[a.category] || 0;
        const bPriority = priorityScore[b.category] || 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }

        // Same priority: sort by change date (newest first)
        return new Date(b.lastChangeDate) - new Date(a.lastChangeDate);
      });

      return {
        packages: analyzedPackages,
        summary: this.generateSummary(analyzedPackages),
        analysisDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error(chalk.red(`❌ Package analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze a single package
   */
  async analyzePackage(packageInfo) {
    const cacheKey = `${packageInfo.name}_${packageInfo.version}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Step 1: Basic package info
      const basicInfo = {
        name: packageInfo.name,
        version: packageInfo.version,
        path: packageInfo.path,
        private: packageInfo.private || false,
        packageJson: packageInfo.packageJson || {}, // Preserve the package.json data
      };

      // Step 2: Publishing status
      const publishingInfo = await this.analyzePublishingStatus(basicInfo);

      // Step 3: Change detection
      const changeInfo = await this.analyzeChanges(basicInfo, publishingInfo);

      // Step 4: Categorization
      const category = this.categorizePackage(basicInfo, publishingInfo, changeInfo);

      // Step 5: Version history
      const versionHistory = await this.getVersionHistory(basicInfo.name);

      const analysis = {
        ...basicInfo,
        ...publishingInfo,
        ...changeInfo,
        category,
        versionHistory,
        icon: this.getPackageIcon(category),
        recommendation: this.generateRecommendation(category, publishingInfo, changeInfo),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now(),
      });

      return analysis;
    } catch (error) {
      return {
        name: packageInfo.name,
        version: packageInfo.version,
        path: packageInfo.path,
        category: 'error',
        icon: '❌',
        error: error.message,
        lastChangeDate: new Date().toISOString(),
        packageJson: packageInfo.packageJson || {}, // Preserve packageJson even in error case
      };
    }
  }

  /**
   * Get all workspace packages using pnpm
   */
  async getWorkspacePackages() {
    try {
      const output = execSync('pnpm ls --recursive --depth=0 --json', {
        encoding: 'utf8',
        cwd: this.repoRoot,
      });
      const packagesData = JSON.parse(output);

      const packages = [];
      for (const pkg of packagesData) {
        if (pkg.name && !pkg.name.includes('monorepo')) {
          const packagePath = pkg.path || pkg.name;
          const packageJsonPath = join(packagePath, 'package.json');

          if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

            packages.push({
              name: pkg.name,
              version: pkg.version,
              path: packagePath,
              packageJson,
            });
          }
        }
      }

      return packages;
    } catch {
      console.warn(chalk.yellow('⚠️  Could not use pnpm workspace, falling back to manual scan'));
      return this.scanPackagesManually();
    }
  }

  /**
   * Fallback manual package scanning
   */
  async scanPackagesManually() {
    const packages = [];
    const directories = ['packages', 'tools'];

    for (const dir of directories) {
      try {
        const dirPath = join(this.repoRoot, dir);

        // Check if directory exists
        if (!existsSync(dirPath)) {
          continue;
        }

        // Read the directory contents
        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const packageJsonPath = join(dirPath, entry.name, 'package.json');

            try {
              // Check if package.json exists
              if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                const packagePath = relative(this.repoRoot, join(dirPath, entry.name));

                if (!packageJson.private) {
                  packages.push({
                    name: packageJson.name,
                    version: packageJson.version,
                    path: packagePath,
                    packageJson,
                  });
                }
              }
            } catch (pkgError) {
              console.warn(
                chalk.yellow(`⚠️  Could not parse ${packageJsonPath}: ${pkgError.message}`),
              );
            }
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not scan ${dir}: ${error.message}`));
      }
    }

    return packages;
  }

  /**
   * Analyze publishing status
   */
  async analyzePublishingStatus(packageInfo) {
    try {
      // Check if package exists in npm registry
      const result = execSync(`npm view ${packageInfo.name} --json`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const npmData = JSON.parse(result);
      const latestVersion = npmData['dist-tags']?.latest;

      return {
        published: true,
        latestPublishedVersion: latestVersion,
        allVersions: npmData.versions || [],
        publishDate: npmData.time?.modified || null,
        npmData: {
          description: npmData.description,
          author: npmData.author,
          maintainers: npmData.maintainers,
          dependencies: npmData.dependencies,
        },
      };
    } catch (error) {
      if (error.status === 1) {
        // Package not found in registry
        return {
          published: false,
          latestPublishedVersion: null,
          allVersions: [],
          publishDate: null,
          npmData: null,
        };
      }
      throw error;
    }
  }

  /**
   * Analyze changes since last published version
   */
  async analyzeChanges(packageInfo, publishingInfo) {
    const changes = {
      hasChanges: false,
      lastChangeDate: null,
      changedFiles: [],
      changeSummary: '',
      gitHistory: [],
    };

    try {
      // Get last commit date for package directory
      const lastCommitOutput = execSync(`git log -1 --format="%ci" -- ${packageInfo.path}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: this.repoRoot,
      }).trim();

      if (lastCommitOutput) {
        changes.lastChangeDate = lastCommitOutput;
      }

      // If package is published, check for changes since publication
      if (publishingInfo.published && publishingInfo.publishDate) {
        const publishDate = new Date(publishingInfo.publishDate).toISOString().split('T')[0];

        // Get commits since publication date
        const commitsSincePublish = execSync(
          `git log --since="${publishDate}" --format="%h|%s|%ci" -- ${packageInfo.path}`,
          {
            encoding: 'utf8',
            stdio: 'pipe',
            cwd: this.repoRoot,
          },
        ).trim();

        if (commitsSincePublish) {
          changes.hasChanges = true;
          changes.gitHistory = commitsSincePublish.split('\n').map(line => {
            const [hash, subject, date] = line.split('|');
            return { hash, subject, date };
          });

          // Get changed files
          const changedFilesOutput = execSync(
            `git diff --name-only HEAD~10 HEAD -- ${packageInfo.path}`,
            {
              encoding: 'utf8',
              stdio: 'pipe',
              cwd: this.repoRoot,
            },
          ).trim();

          if (changedFilesOutput) {
            changes.changedFiles = changedFilesOutput.split('\n').filter(Boolean);
          }

          changes.changeSummary = `${changes.gitHistory.length} commits since publication`;
        }
      } else {
        // New package - get all commits for this package
        const allCommits = execSync(`git log --format="%h|%s|%ci" -- ${packageInfo.path}`, {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: this.repoRoot,
        }).trim();

        if (allCommits) {
          changes.hasChanges = true;
          changes.gitHistory = allCommits.split('\n').map(line => {
            const [hash, subject, date] = line.split('|');
            return { hash, subject, date };
          });
          changes.changeSummary = `${changes.gitHistory.length} total commits`;
        }
      }
    } catch (error) {
      console.warn(
        chalk.yellow(`⚠️  Could not analyze changes for ${packageInfo.name}: ${error.message}`),
      );
    }

    return changes;
  }

  /**
   * Categorize package based on analysis
   */
  categorizePackage(packageInfo, publishingInfo, changeInfo) {
    // New package (never published)
    if (!publishingInfo.published) {
      return 'new-package';
    }

    // Version downgrade
    if (this.compareVersions(packageInfo.version, publishingInfo.latestPublishedVersion) < 0) {
      return 'version-downgrade';
    }

    // Version bump
    if (this.compareVersions(packageInfo.version, publishingInfo.latestPublishedVersion) > 0) {
      return 'version-bump';
    }

    // Same version but has changes
    if (changeInfo.hasChanges) {
      return 'updated-package';
    }

    // Same version, no changes
    return 'unchanged-package';
  }

  /**
   * Get package icon based on category
   */
  getPackageIcon(category) {
    const icons = {
      'new-package': '🆕',
      'version-bump': '📈',
      'updated-package': '🔄',
      'unchanged-package': '✅',
      'version-downgrade': '📉',
      error: '❌',
      unknown: '❓',
    };
    return icons[category] || '❓';
  }

  /**
   * Generate recommendation for package
   */
  generateRecommendation(category, _publishingInfo, _changeInfo) {
    switch (category) {
      case 'new-package':
        return 'Ready for first publication';
      case 'version-bump':
        return 'New version ready for publishing';
      case 'updated-package':
        return 'Changes detected - consider version bump';
      case 'unchanged-package':
        return 'No changes - ready for publishing if needed';
      case 'version-downgrade':
        return 'Version downgrade detected - fix version number';
      case 'error':
        return 'Analysis failed - manual review required';
      default:
        return 'Manual review recommended';
    }
  }

  /**
   * Compare two semantic version strings
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
   * Get version history from npm
   */
  async getVersionHistory(packageName) {
    try {
      const output = execSync(`npm view ${packageName} time --json`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const timeData = JSON.parse(output);
      const versions = [];

      for (const [version, date] of Object.entries(timeData)) {
        if (version !== 'created' && version !== 'modified') {
          versions.push({ version, date, type: 'published' });
        }
      }

      return versions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
      return [];
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary(analyzedPackages) {
    const summary = {
      total: analyzedPackages.length,
      newPackages: 0,
      updatedPackages: 0,
      unchangedPackages: 0,
      versionBumps: 0,
      errors: 0,
      packagesReadyForPublishing: 0,
    };

    for (const pkg of analyzedPackages) {
      summary[pkg.category.replace('-package', 'Packages')]++;
      if (pkg.category === 'new-package' || pkg.category === 'version-bump') {
        summary.packagesReadyForPublishing++;
      }
      if (pkg.category === 'error') {
        summary.errors++;
      }
    }

    return summary;
  }

  /**
   * Display analysis results
   */
  displayAnalysisResults(analysis) {
    console.log(chalk.blue.bold('\n📊 Smart Package Analysis Results\n'));

    // Display summary
    console.log(chalk.yellow('Summary:'));
    console.log(`  Total Packages: ${analysis.summary.total}`);
    console.log(`  🆕 New Packages: ${analysis.summary.newPackages}`);
    console.log(`  📈 Version Bumps: ${analysis.summary.versionBumps}`);
    console.log(`  🔄 Updated Packages: ${analysis.summary.updatedPackages}`);
    console.log(`  ✅ Unchanged Packages: ${analysis.summary.unchangedPackages}`);
    console.log(`  📦 Ready for Publishing: ${analysis.summary.packagesReadyForPublishing}`);

    // Display packages
    console.log(chalk.blue('\nPackage Details:'));
    for (const pkg of analysis.packages) {
      const statusLine = `${pkg.icon} ${pkg.name}@${pkg.version}`;
      const categoryLine = chalk.gray(`   Category: ${pkg.category.replace('-', ' ')}`);
      const recommendationLine = chalk.cyan(`   Recommendation: ${pkg.recommendation}`);

      if (pkg.published) {
        const versionInfo = chalk.green(`   Latest Published: ${pkg.latestPublishedVersion}`);
        console.log(`${statusLine}\n${categoryLine}\n${versionInfo}\n${recommendationLine}\n`);
      } else {
        const versionInfo = chalk.yellow(`   Status: Never published`);
        console.log(`${statusLine}\n${categoryLine}\n${versionInfo}\n${recommendationLine}\n`);
      }
    }
  }
}

export default SmartPackageAnalyzer;
