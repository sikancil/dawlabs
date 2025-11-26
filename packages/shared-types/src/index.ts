/**
 * DAWLabs Shared Types Library
 *
 * Centralized TypeScript type definitions and utility functions for DAWLabs monorepo.
 * This package provides common interfaces, error handling, and utility functions
 * used across all DAWLabs packages to ensure consistency and reduce duplication.
 *
 * @author DAWLabs Team
 * @version 1.0.0
 * @license MIT
 */

/**
 * Standard package metadata interface for all DAWLabs packages
 * Provides consistent structure for package information across the monorepo
 */
export interface PackageInfo {
  /** Package name in npm format (@dawlabs/package-name) */
  name: string;
  /** Semantic version string (e.g., "1.0.0") */
  version: string;
  /** Optional package description for npm registry */
  description?: string;
  /** Package author information */
  author?: string;
  /** Package license identifier */
  license?: string;
}

/**
 * Command-line interface options for DAWLabs CLI tools
 * Standardizes common CLI parameters across all command-line utilities
 */
export interface CLIOptions {
  /** Enable verbose output with additional details */
  verbose?: boolean;
  /** Path to configuration file */
  config?: string;
  /** Output directory or file path */
  output?: string;
  /** Execute in dry-run mode without making changes */
  dryRun?: boolean;
}

/**
 * Standard result type for CLI command execution
 * Provides consistent return structure for command-line operations
 */
export interface CommandResult {
  /** Execution success status */
  success: boolean;
  /** Optional informational message */
  message?: string;
  /** Optional returned data payload */
  data?: unknown;
  /** Error information if execution failed */
  error?: Error;
}

/**
 * Configuration interface for NestJS modules in DAWLabs packages
 * Standardizes module configuration patterns across NestJS applications
 */
export interface NestJSModuleConfig {
  /** Whether the module should be globally available */
  global?: boolean;
  /** Custom module path for dynamic imports */
  modulePath?: string;
}

/**
 * Database connection configuration interface
 * Standardizes database connection parameters across DAWLabs packages
 */
export interface DatabaseConfig {
  /** Database server hostname or IP address */
  host: string;
  /** Database server port number */
  port: number;
  /** Database name */
  database: string;
  /** Database username for authentication */
  username: string;
  /** Database password for authentication */
  password: string;
}

/**
 * Custom error class for DAWLabs-specific errors
 * Provides consistent error handling with optional error codes and details
 */
export class DawlabsError extends Error {
  /** Optional machine-readable error code for programmatic handling */
  public readonly code?: string;
  /** Additional error context or details */
  public readonly details?: unknown;

  /**
   * Creates a new DawlabsError instance
   *
   * @param message - Human-readable error message
   * @param code - Optional machine-readable error code
   * @param details - Optional additional error context
   */
  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'DawlabsError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Utility function to create standardized PackageInfo objects
 * Merges partial input with sensible defaults for required fields
 *
 * @param info - Partial package information to merge with defaults
 * @returns Complete PackageInfo object with required fields filled
 */
export const createPackageInfo = (info: Partial<PackageInfo>): PackageInfo => ({
  name: '',
  version: '1.0.0',
  ...info,
});

/**
 * Utility function to create success command results
 * Standardizes successful operation results across CLI tools
 *
 * @param data - Optional data payload to include in the result
 * @param message - Optional success message
 * @returns CommandResult object indicating success
 */
export const createSuccessResult = <T = unknown>(data?: T, message?: string): CommandResult => ({
  success: true,
  message,
  data,
});

/**
 * Utility function to create error command results
 * Standardizes error handling across CLI tools with consistent structure
 *
 * @param error - Error object or error message string
 * @param message - Optional additional context message
 * @returns CommandResult object indicating failure
 */
export const createErrorResult = (error: Error | string, message?: string): CommandResult => ({
  success: false,
  message,
  error: typeof error === 'string' ? new Error(error) : error,
});
