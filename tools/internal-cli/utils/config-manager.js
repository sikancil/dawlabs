import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Configuration Manager for DAWLabs Monorepo
 * Manages identity.dawlabs.json and deployment.json configuration files
 */
export class ConfigManager {
  /**
   * Detect monorepo root by looking for indicator files
   */
  static detectMonorepoRoot(startPath = process.cwd()) {
    const indicatorFiles = [
      '.identity.dawlabs.json',
      'pnpm-workspace.yaml',
      'turbo.json',
      'lerna.json',
    ];

    let currentPath = startPath;

    // Traverse up the directory tree looking for indicator files
    while (currentPath !== '/' && currentPath !== currentPath.split('/').slice(0, -1).join('/')) {
      for (const indicator of indicatorFiles) {
        if (existsSync(join(currentPath, indicator))) {
          return currentPath;
        }
      }
      currentPath = currentPath.split('/').slice(0, -1).join('/');
    }

    // If no indicators found, return the original path
    return startPath;
  }
  constructor(rootPath = null) {
    // Auto-detect monorepo root if not provided
    this.rootPath = rootPath || ConfigManager.detectMonorepoRoot();
    this.identityPath = join(this.rootPath, '.identity.dawlabs.json');
    this.identityExamplePath = join(this.rootPath, '.identity.example.json');
    this.deploymentPath = join(this.rootPath, 'tools', 'internal-cli', 'config', 'deployment.json');
    this.deploymentExamplePath = join(
      this.rootPath,
      'tools',
      'internal-cli',
      'config',
      'deployment.example.json',
    );
  }

  /**
   * Load identity configuration
   */
  loadIdentityConfig() {
    try {
      if (!existsSync(this.identityPath)) {
        throw new Error(`Identity configuration not found: ${this.identityPath}`);
      }
      return JSON.parse(readFileSync(this.identityPath, 'utf8'));
    } catch (_error) {
      throw new Error(`Failed to load identity configuration: ${_error.message}`);
    }
  }

  /**
   * Load deployment configuration
   */
  loadDeploymentConfig() {
    try {
      if (!existsSync(this.deploymentPath)) {
        throw new Error(`Deployment configuration not found: ${this.deploymentPath}`);
      }
      return JSON.parse(readFileSync(this.deploymentPath, 'utf8'));
    } catch (_error) {
      throw new Error(`Failed to load deployment configuration: ${_error.message}`);
    }
  }

  /**
   * Load both configurations and merge them
   */
  loadAllConfigs() {
    const identity = this.loadIdentityConfig();
    const deployment = this.loadDeploymentConfig();

    return {
      identity,
      deployment,
      merged: {
        ...identity,
        deployment: deployment.deployment || {},
      },
    };
  }

  /**
   * Discover packages in the monorepo
   */
  discoverPackages() {
    const packageDirs = ['packages', 'tools', 'apps'];

    const discoveredPackages = [];

    for (const dir of packageDirs) {
      const dirPath = join(this.rootPath, dir);

      if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
        try {
          const subdirs = readdirSync(dirPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          for (const subdir of subdirs) {
            const packageJsonPath = join(dirPath, subdir, 'package.json');

            if (existsSync(packageJsonPath)) {
              try {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                const packageDir = join(dir, subdir);
                const packageType = this.determinePackageType(packageJson, packageDir);

                discoveredPackages.push({
                  name: packageJson.name,
                  path: packageDir,
                  type: packageType,
                  version: packageJson.version,
                  private: packageJson.private || false,
                });
              } catch (_error) {
                // Skip invalid package.json files
                console.warn(
                  chalk.yellow(`Warning: Could not read ${packageJsonPath}: ${_error.message}`),
                );
              }
            }
          }
        } catch (_error) {
          // Directory couldn't be read - continue
        }
      }
    }

    return discoveredPackages.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Determine package type based on location and content
   */
  determinePackageType(packageJson, packageDir) {
    // Check for binaries (CLI tools)
    if (packageJson.bin) return 'cli';

    // Check for tool-specific indicators
    if (packageDir.startsWith('tools/')) return 'tool';
    if (packageDir.startsWith('apps/')) return 'app';

    // Default to library
    return 'library';
  }

  /**
   * Initialize identity configuration from template
   */
  initializeIdentityConfig(options = {}) {
    const { force = false, interactive = false } = options;

    if (existsSync(this.identityPath) && !force) {
      throw new Error('Identity configuration already exists. Use --force to overwrite.');
    }

    if (!existsSync(this.identityExamplePath)) {
      throw new Error(`Identity example template not found: ${this.identityExamplePath}`);
    }

    // Load template
    const template = JSON.parse(readFileSync(this.identityExamplePath, 'utf8'));

    // Discover packages and update template
    const discoveredPackages = this.discoverPackages();

    // Update template with actual values
    const config = {
      ...template,
      monorepo: {
        ...template.monorepo,
        name: this.getRepoName(),
        discoveredPackages,
      },
    };

    if (interactive) {
      // Interactive configuration would go here
      console.log(chalk.blue('🔧 Interactive configuration mode would prompt for values here'));
    }

    writeFileSync(this.identityPath, JSON.stringify(config, null, 2), 'utf8');
    return config;
  }

  /**
   * Initialize deployment configuration from template
   */
  initializeDeploymentConfig(options = {}) {
    const { force = false } = options;

    if (existsSync(this.deploymentPath) && !force) {
      throw new Error('Deployment configuration already exists. Use --force to overwrite.');
    }

    if (!existsSync(this.deploymentExamplePath)) {
      throw new Error(`Deployment example template not found: ${this.deploymentExamplePath}`);
    }

    // Load template
    const template = JSON.parse(readFileSync(this.deploymentExamplePath, 'utf8'));

    writeFileSync(this.deploymentPath, JSON.stringify(template, null, 2), 'utf8');
    return template;
  }

  /**
   * Validate configuration files
   */
  validateConfigs() {
    const issues = [];

    // Check identity configuration
    try {
      const identity = this.loadIdentityConfig();

      // Required fields validation
      const requiredFields = ['monorepo.name', 'organization.npm', 'repository.url'];
      for (const field of requiredFields) {
        const value = this.getNestedValue(identity, field);
        if (!value) {
          issues.push({
            type: 'error',
            file: 'identity.dawlabs.json',
            field,
            message: `Missing required field: ${field}`,
          });
        }
      }

      // Validate discovered packages vs actual packages
      const discoveredPackages = identity.monorepo?.discoveredPackages || [];
      if (discoveredPackages.length === 0) {
        issues.push({
          type: 'warning',
          file: 'identity.dawlabs.json',
          field: 'monorepo.discoveredPackages',
          message: 'No packages discovered. Run config update to refresh.',
        });
      }
    } catch (_error) {
      issues.push({
        type: 'error',
        file: 'identity.dawlabs.json',
        message: `Failed to load: ${_error.message}`,
      });
    }

    // Check deployment configuration
    try {
      const deployment = this.loadDeploymentConfig();

      if (!deployment.deployment) {
        issues.push({
          type: 'error',
          file: 'deployment.json',
          field: 'deployment',
          message: 'Missing deployment configuration section',
        });
      }
    } catch (_error) {
      issues.push({
        type: 'error',
        file: 'deployment.json',
        message: `Failed to load: ${_error.message}`,
      });
    }

    return issues;
  }

  /**
   * Update configurations with new discoveries
   */
  updateConfigs() {
    const updates = [];

    // Update identity configuration with discovered packages
    try {
      const identity = this.loadIdentityConfig();
      const discoveredPackages = this.discoverPackages();

      identity.monorepo.discoveredPackages = discoveredPackages;
      writeFileSync(this.identityPath, JSON.stringify(identity, null, 2), 'utf8');

      updates.push({
        type: 'updated',
        file: 'identity.dawlabs.json',
        message: `Updated with ${discoveredPackages.length} discovered packages`,
      });
    } catch (_error) {
      updates.push({
        type: 'error',
        file: 'identity.dawlabs.json',
        message: `Failed to update: ${_error.message}`,
      });
    }

    return updates;
  }

  /**
   * Display current configuration
   */
  displayConfig(type = 'all') {
    try {
      if (type === 'all' || type === 'identity') {
        const identity = this.loadIdentityConfig();
        console.log(chalk.blue.bold('\n📋 Identity Configuration:'));
        console.log(chalk.gray(`  Repository: ${identity.repository?.url || 'N/A'}`));
        console.log(chalk.gray(`  Organization: ${identity.organization?.npm || 'N/A'}`));
        console.log(
          chalk.gray(
            `  Packages: ${identity.monorepo?.discoveredPackages?.length || 0} discovered`,
          ),
        );
      }

      if (type === 'all' || type === 'deployment') {
        const deployment = this.loadDeploymentConfig();
        console.log(chalk.blue.bold('\n🚀 Deployment Configuration:'));
        console.log(
          chalk.gray(`  Environment: ${deployment.deployment?.defaults?.environment || 'N/A'}`),
        );
        console.log(
          chalk.gray(`  Workflow: ${deployment.deployment?.defaults?.workflowFile || 'N/A'}`),
        );
        console.log(
          chalk.gray(
            `  Oracle Intelligence: ${deployment.oracleIntelligence?.enabled ? 'Enabled' : 'Disabled'}`,
          ),
        );
      }
    } catch (_error) {
      console.log(chalk.red(`Error displaying configuration: ${_error.message}`));
    }
  }

  /**
   * Get repository name from current directory
   */
  getRepoName() {
    const pathParts = this.rootPath.split('/');
    return pathParts[pathParts.length - 1] || 'dawlabs';
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Reset configuration from templates
   */
  resetConfigs(options = {}) {
    const { type = 'all' } = options;
    const results = [];

    if (type === 'all' || type === 'identity') {
      try {
        this.initializeIdentityConfig({ force: true });
        results.push({
          type: 'success',
          file: 'identity.dawlabs.json',
          message: 'Reset from template',
        });
      } catch (_error) {
        results.push({
          type: 'error',
          file: 'identity.dawlabs.json',
          message: _error.message,
        });
      }
    }

    if (type === 'all' || type === 'deployment') {
      try {
        this.initializeDeploymentConfig({ force: true });
        results.push({
          type: 'success',
          file: 'deployment.json',
          message: 'Reset from template',
        });
      } catch (_error) {
        results.push({
          type: 'error',
          file: 'deployment.json',
          message: _error.message,
        });
      }
    }

    return results;
  }
}
