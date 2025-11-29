import chalk from 'chalk';
import inquirer from 'inquirer';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Intelligent Conflict Resolver for package publishing
 */
export class ConflictResolver {
  constructor() {
    this.resolutions = [];
    this.autoResolved = 0;
    this.manualResolved = 0;
  }

  /**
   * Analyze all packages for conflicts and generate resolutions
   */
  async analyzeAndResolveConflicts(packageAnalyses) {
    console.log(chalk.blue('\n🔍 Intelligent Package Analysis\n'));

    // Categorize packages by status
    const categorized = this.categorizePackages(packageAnalyses);
    this.displayAnalysisSummary(categorized);

    // Generate resolution strategies
    const conflicts = this.identifyConflicts(categorized);

    if (conflicts.length === 0) {
      console.log(chalk.green('✅ No conflicts detected. All packages are ready to publish.\n'));
      return {
        hasConflicts: false,
        packages: packageAnalyses,
        autoResolved: 0,
        manualResolved: 0,
      };
    }

    console.log(chalk.yellow(`⚠️  Found ${conflicts.length} package(s) with conflicts\n`));

    // Attempt auto-resolution first
    const autoResolutions = await this.attemptAutoResolution(conflicts);
    const remainingConflicts = conflicts.filter(
      c => !autoResolutions.some(ar => ar.packageName === c.packageName),
    );

    // Handle remaining conflicts manually
    if (remainingConflicts.length > 0) {
      await this.handleManualResolution(remainingConflicts);
    }

    // Apply all approved resolutions
    await this.applyResolutions(autoResolutions.concat(this.resolutions));

    return {
      hasConflicts: true,
      packages: packageAnalyses,
      autoResolved: this.autoResolved,
      manualResolved: this.manualResolved,
      resolutions: autoResolutions.concat(this.resolutions),
    };
  }

  /**
   * Categorize packages by their publishing status
   */
  categorizePackages(packageAnalyses) {
    return {
      newPackages: packageAnalyses.filter(p => p.status === 'new-package'),
      versionBumps: packageAnalyses.filter(p => p.status === 'version-bump'),
      conflicts: packageAnalyses.filter(p => p.conflicts.length > 0),
      readyToPublish: packageAnalyses.filter(
        p => p.conflicts.length === 0 && p.status !== 'version-downgrade',
      ),
    };
  }

  /**
   * Display comprehensive analysis summary
   */
  displayAnalysisSummary(categorized) {
    console.log(chalk.bold('📊 Package State Analysis:'));

    // New packages
    if (categorized.newPackages.length > 0) {
      console.log(chalk.green(`\n🆕 New Packages (${categorized.newPackages.length}):`));
      categorized.newPackages.forEach(pkg => {
        console.log(`  ✅ ${pkg.packageName}@${pkg.localVersion} - Safe to publish`);
      });
    }

    // Version bumps
    if (categorized.versionBumps.length > 0) {
      console.log(chalk.blue(`\n⬆️  Version Bumps (${categorized.versionBumps.length}):`));
      categorized.versionBumps.forEach(pkg => {
        console.log(
          `  📈 ${pkg.packageName}@${pkg.localVersion} (from ${pkg.latestPublished}) - Ready to publish`,
        );
      });
    }

    // Ready to publish
    if (categorized.readyToPublish.length > 0) {
      console.log(chalk.green(`\n✅ Ready to Publish (${categorized.readyToPublish.length}):`));
      categorized.readyToPublish.forEach(pkg => {
        console.log(`  ✅ ${pkg.packageName}@${pkg.localVersion} - No conflicts`);
      });
    }

    // Conflicts
    if (categorized.conflicts.length > 0) {
      console.log(chalk.red(`\n⚠️  Conflicts Detected (${categorized.conflicts.length}):`));
      categorized.conflicts.forEach(pkg => {
        pkg.conflicts.forEach(conflict => {
          const icon = conflict.severity === 'high' ? '🚨' : '⚠️';

          console.log(`  ${icon} ${pkg.packageName}@${pkg.localVersion}: ${conflict.message}`);
        });
      });
    }

    console.log(''); // Empty line for spacing
  }

  /**
   * Identify packages with conflicts
   */
  identifyConflicts(categorized) {
    return categorized.conflicts.map(pkg => ({
      packageName: pkg.packageName,
      localVersion: pkg.localVersion,
      status: pkg.status,
      conflicts: pkg.conflicts,
      recommendations: pkg.recommendations,
      packagePath: pkg.packagePath,
    }));
  }

  /**
   * Attempt automatic resolution for resolvable conflicts
   */
  async attemptAutoResolution(conflicts) {
    const autoResolvable = conflicts.filter(c =>
      c.conflicts.some(
        conflict => conflict.type === 'version-exists' && c.recommendations.autoResolvable,
      ),
    );

    if (autoResolvable.length === 0) return [];

    console.log(chalk.blue('🤖 Attempting Automatic Resolution:\n'));

    for (const conflict of autoResolvable) {
      const versionConflict = conflict.conflicts.find(c => c.type === 'version-exists');
      const suggestedVersion = conflict.recommendations.suggestedVersion;

      console.log(chalk.yellow(`📦 ${conflict.packageName}:`));

      console.log(chalk.gray(`   Current: ${conflict.localVersion}`));

      console.log(chalk.gray(`   Suggested: ${suggestedVersion}`));

      console.log(chalk.gray(`   Reason: ${versionConflict.message}`));

      const { shouldAutoBump } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldAutoBump',
          message: `Auto-bump ${conflict.packageName} to ${suggestedVersion}?`,
          default: true,
        },
      ]);

      if (shouldAutoBump) {
        this.autoResolved++;
        autoResolvable.push({
          ...conflict,
          resolution: 'auto-version-bump',
          action: () => this.updatePackageVersion(conflict.packagePath, suggestedVersion),
          newVersion: suggestedVersion,
        });

        console.log(chalk.green(`   ✅ Will auto-bump to ${suggestedVersion}\n`));
      } else {
        console.log(chalk.red(`   ❌ Skipped auto-resolution\n`));
      }
    }

    return autoResolvable.filter(ar => ar.resolution);
  }

  /**
   * Handle manual conflict resolution
   */
  async handleManualResolution(conflicts) {
    console.log(chalk.blue('🔧 Manual Conflict Resolution Required:\n'));

    for (const conflict of conflicts) {
      console.log(chalk.yellow(`📦 ${conflict.packageName}@${conflict.localVersion}:`));

      conflict.conflicts.forEach(c => {
        console.log(chalk.red(`   ${c.severity === 'high' ? '🚨' : '⚠️'} ${c.message}`));
      });

      console.log(chalk.blue(`\n💡 Recommendation: ${conflict.recommendations.message}`));

      const { resolutionAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'resolutionAction',
          message: `How would you like to resolve ${conflict.packageName}?`,
          choices: [
            {
              name: `📝 Bump to ${conflict.recommendations.suggestedVersion}`,
              value: 'version-bump',
            },
            {
              name: `✏️  Enter custom version`,
              value: 'custom-version',
            },
            {
              name: `⏭️  Skip publishing this package`,
              value: 'skip-package',
            },
            {
              name: `❌ Cancel workflow`,
              value: 'cancel',
            },
          ],
        },
      ]);

      if (resolutionAction === 'cancel') {
        console.log(chalk.red('❌ Workflow cancelled by user\n'));
        process.exit(1);
      }

      if (resolutionAction === 'version-bump') {
        const newVersion = conflict.recommendations.suggestedVersion;
        this.manualResolved++;
        this.resolutions.push({
          ...conflict,
          resolution: 'manual-version-bump',
          action: () => this.updatePackageVersion(conflict.packagePath, newVersion),
          newVersion,
        });

        console.log(chalk.green(`   ✅ Will bump to ${newVersion}\n`));
      } else if (resolutionAction === 'custom-version') {
        const { customVersion } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customVersion',
            message: 'Enter custom version (format: x.y.z):',
            validate: input => {
              const semverRegex = /^\d+\.\d+\.\d+$/;
              return semverRegex.test(input) || 'Please enter a valid semantic version (x.y.z)';
            },
          },
        ]);

        this.manualResolved++;
        this.resolutions.push({
          ...conflict,
          resolution: 'custom-version-bump',
          action: () => this.updatePackageVersion(conflict.packagePath, customVersion),
          newVersion: customVersion,
        });

        console.log(chalk.green(`   ✅ Will bump to ${customVersion}\n`));
      } else {
        console.log(chalk.gray(`   ⏭️  Skipping ${conflict.packageName}\n`));
      }
    }
  }

  /**
   * Apply all approved resolutions
   */
  async applyResolutions(resolutions) {
    if (resolutions.length === 0) return;

    console.log(chalk.blue('🔧 Applying Resolutions:\n'));

    for (const resolution of resolutions) {
      try {
        console.log(chalk.yellow(`📦 ${resolution.packageName}:`));

        console.log(
          chalk.gray(`   Updating ${resolution.localVersion} → ${resolution.newVersion}`),
        );

        await resolution.action();

        console.log(chalk.green(`   ✅ Updated to ${resolution.newVersion}\n`));
      } catch (error) {
        console.log(chalk.red(`   ❌ Failed to update: ${error.message}\n`));
        throw error;
      }
    }

    console.log(
      chalk.green(
        `🎉 Resolutions Applied: ${this.autoResolved} auto, ${this.manualResolved} manual\n`,
      ),
    );
  }

  /**
   * Update package version in package.json
   */
  async updatePackageVersion(packagePath, newVersion) {
    const packageJsonPath = join(packagePath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    packageJson.version = newVersion;

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  }

  /**
   * Generate resolution summary
   */
  generateSummary(results) {
    console.log(chalk.bold.green('\n📋 Conflict Resolution Summary:'));

    console.log(`🤖 Auto-resolved: ${results.autoResolved} package(s)`);

    console.log(`🔧 Manually resolved: ${results.manualResolved} package(s)`);

    console.log(
      `✅ Ready to publish: ${results.packages.filter(p => p.conflicts.length === 0).length} package(s)`,
    );

    console.log('');
  }
}
