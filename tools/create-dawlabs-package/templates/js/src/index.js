/**
 * {{description}} - Pure JavaScript Library Template
 *
 * @context Template-generated JavaScript library for the DAWLabs monorepo
 * @purpose Provides a foundational library structure with configurable behavior and utility functions
 * @integration Template serves as starting point for new JavaScript packages in the monorepo
 * @workflow Generated from create-dawlabs-package tool with variable substitution for customization
 *
 * Template Features:
 * - Configurable class-based architecture
 * - Factory function for easy instantiation
 * - Configuration management with merge capabilities
 * - Multiple export patterns for compatibility
 * - Placeholder system for customization
 *
 * Architecture Pattern:
 * - Main class with configuration-driven behavior
 * - Utility functions for streamlined usage
 * - Both CommonJS and ES Module export support
 * - Extensible design for additional functionality
 *
 * Variable Substitution:
 * - {{className}}: Replaced with actual class name during generation
 * - {{description}}: Replaced with package description
 * - Additional variables can be added as needed
 *
 * Customization Points:
 * - Implement the execute() method with core functionality
 * - Add configuration validation and defaults
 * - Extend with additional methods as needed
 * - Add error handling and logging
 *
 * @example
 * // After template generation with "MyLib" as className:
 * const lib = createMyLib({ option: 'value' });
 * const result = lib.execute(input);
 * console.log(lib.getConfig());
 *
 * @template
 */

// Core functionality
class {{className}}Lib {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Main library method
   * @param {*} input - Input data
   * @returns {*} - Processed data
   */
  execute(input) {
    // Implementation will be added here
    // Use config to prevent unused variable warning
    void this.config;
    return input;
  }

  /**
   * Get current configuration
   * @returns {Object} - Current config
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration to merge
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset to default configuration
   */
  resetConfig() {
    this.config = {};
  }
}

// Utility functions
function create{{className}}Lib(config) {
  return new {{className}}Lib(config);
}

// Export for both CommonJS and ES Modules
const {{className}}Package = {
  {{className}}Lib,
  create{{className}}Lib,
};

// ES Module export
export { {{className}}Lib, create{{className}}Lib };
export default {{className}}Package;