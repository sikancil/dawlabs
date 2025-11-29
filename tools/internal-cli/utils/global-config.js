import { ConfigManager } from './config-manager.js';
import chalk from 'chalk';

/**
 * Global Configuration Provider
 * Centralized access to identity and deployment configuration across the CLI
 */
class GlobalConfig {
  constructor() {
    this.configManager = new ConfigManager();
    this._cache = null;
    this._cacheTimestamp = null;
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load and cache configuration
   */
  loadConfig(forceRefresh = false) {
    const now = Date.now();

    // Return cached config if still valid
    if (this._cache && !forceRefresh && now - this._cacheTimestamp < this._cacheTimeout) {
      return this._cache;
    }

    try {
      const config = this.configManager.loadAllConfigs();
      this._cache = config;
      this._cacheTimestamp = now;
      return config;
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Configuration loading failed: ${error.message}`));
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration fallback
   */
  getDefaultConfig() {
    return {
      identity: {
        monorepo: {
          name: 'dawlabs',
          npm: {
            client: 'pnpm',
            useWorkspaces: true,
            registry: 'https://registry.npmjs.org/',
            organization: '@dawlabs',
          },
          build: {
            orchestration: 'turbo',
            packageManager: 'pnpm',
            nodeVersion: '20',
          },
        },
        repository: {
          type: 'git',
          defaultBranch: 'main',
        },
        organization: {
          npm: '@dawlabs',
          github: 'dawlabs',
        },
        ci_cd: {
          platform: 'github',
          environment: 'production',
          trustedPublishing: true,
          provenance: true,
        },
      },
      deployment: {
        npm: {
          trustedPublishing: {
            enabled: true,
            requiredPermissions: ['contents: write', 'pull-requests: write', 'id-token: write'],
          },
        },
        oracleIntelligence: {
          enabled: true,
          confidenceThreshold: 0.8,
          riskAssessment: true,
        },
      },
      merged: {},
    };
  }

  /**
   * Get organization information
   */
  getOrganization() {
    const config = this.loadConfig();
    return {
      npm: config.identity?.organization?.npm || '@dawlabs',
      github: config.identity?.organization?.github || 'dawlabs',
      name: config.identity?.organization?.name || 'DAWLabs',
    };
  }

  /**
   * Get npm configuration
   */
  getNpmConfig() {
    const config = this.loadConfig();
    return {
      registry: config.identity?.monorepo?.npm?.registry || 'https://registry.npmjs.org/',
      organization: config.identity?.monorepo?.npm?.organization || '@dawlabs',
      client: config.identity?.monorepo?.npm?.client || 'pnpm',
      useWorkspaces: config.identity?.monorepo?.npm?.useWorkspaces || true,
      trustedPublishing: config.deployment?.npm?.trustedPublishing || {
        enabled: true,
        requiredPermissions: ['contents: write', 'pull-requests: write', 'id-token: write'],
      },
    };
  }

  /**
   * Get repository information
   */
  getRepositoryConfig() {
    const config = this.loadConfig();
    return {
      type: config.identity?.repository?.type || 'git',
      url: config.identity?.repository?.url,
      defaultBranch: config.identity?.repository?.defaultBranch || 'main',
      organization: this.getOrganization().github,
    };
  }

  /**
   * Get build configuration
   */
  getBuildConfig() {
    const config = this.loadConfig();
    return {
      orchestration: config.identity?.monorepo?.build?.orchestration || 'turbo',
      packageManager: config.identity?.monorepo?.build?.packageManager || 'pnpm',
      nodeVersion: config.identity?.monorepo?.build?.nodeVersion || '20',
      environment: config.deployment?.defaults?.environment || 'production',
    };
  }

  /**
   * Get CI/CD configuration
   */
  getCiCdConfig() {
    const config = this.loadConfig();
    return {
      platform: config.identity?.ci_cd?.platform || 'github',
      environment: config.identity?.ci_cd?.environment || 'production',
      trustedPublishing: config.identity?.ci_cd?.trustedPublishing !== false,
      provenance: config.identity?.ci_cd?.provenance !== false,
    };
  }

  /**
   * Get Oracle Intelligence configuration
   */
  getOracleConfig() {
    const config = this.loadConfig();
    return {
      enabled: config.deployment?.oracleIntelligence?.enabled !== false,
      confidenceThreshold: config.deployment?.oracleIntelligence?.confidenceThreshold || 0.8,
      riskAssessment: config.deployment?.oracleIntelligence?.riskAssessment !== false,
    };
  }

  /**
   * Get discovered packages
   */
  getDiscoveredPackages() {
    const config = this.loadConfig();
    return config.identity?.monorepo?.discoveredPackages || [];
  }

  /**
   * Check if package is part of this monorepo
   */
  isMonorepoPackage(packageName) {
    const discoveredPackages = this.getDiscoveredPackages();
    return discoveredPackages.some(pkg => pkg.name === packageName);
  }

  /**
   * Get package scope for validation
   */
  getExpectedPackageScope() {
    return this.getOrganization().npm;
  }

  /**
   * Refresh configuration cache
   */
  refreshCache() {
    return this.loadConfig(true);
  }

  /**
   * Validate configuration is properly loaded
   */
  validateConfiguration() {
    const config = this.loadConfig();

    if (!config.identity || !config.deployment) {
      throw new Error(
        'Configuration files not properly loaded. Run "dawlabs-cli config init" first.',
      );
    }

    return true;
  }
}

// Singleton instance for global access
export const globalConfig = new GlobalConfig();
