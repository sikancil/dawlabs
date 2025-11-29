import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Configuration Manager for DAWLabs Monorepo
 *
 * @context Core configuration management system for DAWLabs deployment intelligence
 * @purpose Manages identity.dawlabs.json and deployment.json configuration files with auto-detection
 * @integration Used throughout the CLI system to provide unified configuration access
 * @workflow Initializes, validates, and maintains monorepo configuration state
 *
 * This class provides comprehensive configuration management for:
 * - Identity configuration (.identity.dawlabs.json) with repository and organization details
 * - Deployment configuration (deployment.json) with CI/CD and Oracle Intelligence settings
 * - Automatic monorepo root detection using multiple indicator files
 * - Package discovery and classification across packages/, tools/, and apps/ directories
 * - Configuration validation with detailed error reporting
 * - Template-based initialization with interactive mode support
 *
 * Key Features:
 * - Auto-detects monorepo root using .identity.dawlabs.json, pnpm-workspace.yaml, turbo.json, or lerna.json
 * - Discovers and categorizes packages (library, cli, tool, app) automatically
 * - Validates required fields and provides actionable error messages
 * - Merges identity and deployment configurations for unified access
 * - Supports both interactive and non-interactive configuration modes
 *
 * @example
 * // Initialize configuration manager with auto-detected root
 * const config = new ConfigManager();
 *
 * // Load and validate all configurations
 * const allConfigs = config.loadAllConfigs();
 * const issues = config.validateConfigs();
 *
 * // Discover packages in the monorepo
 * const packages = config.discoverPackages();
 * console.log(`Found ${packages.length} packages`);
 */
export class ConfigManager {
  /**
   * Detect monorepo root by looking for indicator files
   *
   * @param {string} startPath - Directory path to start detection from (default: process.cwd())
   * @returns {string} Detected monorepo root directory path
   * @static
   *
   * @workflow Traverses up directory tree looking for monorepo indicator files
   * @integration Used by constructor to auto-detect monorepo root when not explicitly provided
   * @purpose Enables configuration system to work from any subdirectory within the monorepo
   *
   * Detection Algorithm:
   * 1. Start from given path (or current working directory)
   * 2. Look for indicator files in current directory:
   *    - .identity.dawlabs.json (primary DAWLabs identifier)
   *    - pnpm-workspace.yaml (pnpm workspaces)
   *    - turbo.json (Turborepo)
   *    - lerna.json (Lerna)
   * 3. If no indicators found, move up one directory level
   * 4. Repeat until indicators found or root directory reached
   * 5. Return original path if no indicators found anywhere
   *
   * @example
   * // Detect from current directory
   * const root = ConfigManager.detectMonorepoRoot();
   *
   * // Detect from specific subdirectory
   * const root = ConfigManager.detectMonorepoRoot('./packages/ncurl');
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

  /**
   * Initialize Configuration Manager
   *
   * @param {string|null} rootPath - Explicit monorepo root path or null for auto-detection
   * @constructor
   *
   * @workflow Sets up configuration file paths and initializes manager state
   * @integration Entry point for all configuration operations throughout the CLI system
   * @purpose Provides centralized configuration management with automatic path resolution
   *
   * Path Resolution Strategy:
   * - If rootPath provided: Use as explicit monorepo root
   * - If rootPath is null: Auto-detect using detectMonorepoRoot()
   * - Initialize all configuration file paths relative to detected root
   *
   * Configuration Files Managed:
   * - Identity Config: .identity.dawlabs.json (primary monorepo identity)
   * - Identity Template: .identity.example.json (for initialization)
   * - Deployment Config: tools/internal-cli/config/deployment.json
   * - Deployment Template: tools/internal-cli/config/deployment.example.json
   *
   * @example
   * // Auto-detect monorepo root from current directory
   * const config = new ConfigManager();
   *
   * // Use explicit root path
   * const config = new ConfigManager('/path/to/monorepo');
   */
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
   * Load identity configuration from .identity.dawlabs.json
   *
   * @returns {Object} Parsed identity configuration object
   * @throws {Error} If configuration file not found or invalid JSON
   *
   * @workflow Loads and parses identity configuration file with error handling
   * @integration Provides access to monorepo identity settings for all CLI operations
   * @purpose Centralizes identity configuration access with validation
   *
   * Expected Configuration Structure:
   * - monorepo.name: Repository name
   * - monorepo.discoveredPackages: Array of discovered packages
   * - organization.npm: NPM organization name
   * - repository.url: Git repository URL
   *
   * @example
   * const identity = config.loadIdentityConfig();
   * console.log(`Repository: ${identity.repository.url}`);
   * console.log(`Organization: ${identity.organization.npm}`);
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
   * Load deployment configuration from deployment.json
   *
   * @returns {Object} Parsed deployment configuration object
   * @throws {Error} If configuration file not found or invalid JSON
   *
   * @workflow Loads and parses deployment configuration with CI/CD and Oracle Intelligence settings
   * @integration Provides deployment settings for CI/CD workflow generation and validation
   * @purpose Centralizes deployment configuration access for automated publishing workflows
   *
   * Expected Configuration Structure:
   * - deployment.defaults: Default deployment settings (environment, workflowFile)
   * - deployment.environments: Environment-specific configurations
   * - oracleIntelligence: Oracle Intelligence system configuration
   * - cicd: CI/CD pipeline settings and templates
   *
   * @example
   * const deployment = config.loadDeploymentConfig();
   * const defaults = deployment.deployment.defaults;
   * console.log(`Default environment: ${defaults.environment}`);
   * console.log(`Oracle Intelligence: ${deployment.oracleIntelligence.enabled ? 'Enabled' : 'Disabled'}`);
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
   * Load both configurations and merge them into unified structure
   *
   * @returns {Object} Unified configuration object with identity, deployment, and merged properties
   * @returns {Object} returns.identity - Identity configuration object
   * @returns {Object} returns.deployment - Deployment configuration object
   * @returns {Object} returns.merged - Merged configuration combining identity and deployment
   * @throws {Error} If any configuration file cannot be loaded
   *
   * @workflow Loads identity and deployment configurations, then merges into unified structure
   * @integration Primary method for accessing complete configuration across CLI system
   * @purpose Provides single-point access to all configuration data with intelligent merging
   *
   * Merge Strategy:
   * - identity: Preserved as-is for identity-specific access
   * - deployment: Preserved as-is for deployment-specific access
   * - merged: Combines identity properties with deployment.deployment namespace
   *
   * @example
   * const configs = config.loadAllConfigs();
   * console.log(`Repository: ${configs.identity.repository.url}`);
   * console.log(`Environment: ${configs.merged.deployment.environment}`);
   * console.log(`Oracle Intelligence: ${configs.deployment.oracleIntelligence.enabled}`);
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
   * Discover packages in the monorepo across standard directories
   *
   * @returns {Array<Object>} Array of discovered package objects with metadata
   * @returns {string} returns[].name - Package name from package.json
   * @returns {string} returns[].path - Relative path from monorepo root
   * @returns {string} returns[].type - Package type (library/cli/tool/app)
   * @returns {string} returns[].version - Package version from package.json
   * @returns {boolean} returns[].private - Whether package is marked as private
   *
   * @workflow Scans standard monorepo directories and parses package.json files
   * @integration Used by configuration system to maintain package registry and validate setup
   * @purpose Automatic package discovery for monorepo management and deployment workflows
   *
   * Discovery Algorithm:
   * 1. Scan packages/, tools/, and apps/ directories for subdirectories
   * 2. Look for package.json files in each subdirectory
   * 3. Parse valid package.json files and extract metadata
   * 4. Determine package type based on location and content:
   *    - cli: Has bin property in package.json
   *    - tool: Located in tools/ directory
   *    - app: Located in apps/ directory
   *    - library: Default type for packages/ directory
   * 5. Sort packages alphabetically by name
   * 6. Return array of package objects with full metadata
   *
   * Error Handling:
   * - Skips directories that cannot be read
   * - Warns about invalid package.json files but continues processing
   * - Returns empty array if no packages found
   *
   * @example
   * const packages = config.discoverPackages();
   * console.log(`Found ${packages.length} packages:`);
   * packages.forEach(pkg => {
   *   console.log(`- ${pkg.name}@${pkg.version} (${pkg.type})`);
   * });
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
