/**
 * {{description}} - NestJS Plugin Template
 *
 * @context Template-generated NestJS plugin module for the DAWLabs monorepo
 * @purpose Provides a modular NestJS plugin structure with dependency injection, configuration management, and extensibility
 * @integration Template serves as foundation for new NestJS plugins within the monorepo ecosystem
 * @workflow Generated from create-dawlabs-package tool with variable substitution for rapid plugin development
 *
 * NestJS Plugin Architecture:
 * - Dynamic module configuration with provider injection
 * - Configurable global/module scope with proper registration
 * - Service and controller separation with clean architecture
 * - Dependency injection patterns for testing and modularity
 * - Export flexibility for different integration scenarios
 *
 * Template Features:
 * - Automatic provider configuration with value injection
 * - Service and controller registration with imports
 * - Global module support for application-wide functionality
 * - Flexible export system for downstream integration
 * - Placeholder system for customization
 *
 * Variable Substitution:
 * - {{className}}: Replaced with actual plugin class name during generation
 * - {{description}}: Replaced with plugin description
 * - {{constantCase}}: Replaced with uppercase constant name (e.g., MY_PLUGIN)
 * - Additional variables can be added as needed for customization
 *
 * NestJS Integration Patterns:
 * - Factory function pattern for module creation
 * - Provider configuration with dependency injection
 * - Service and controller separation for maintainability
 * - Optional global registration for application-wide functionality
 * - Module metadata with proper imports and exports
 *
 * Extensibility:
 * - Add additional providers through configuration options
 * - Customize module configuration with default values
 * - Export additional components for external usage
 * - Support for custom service and controller implementations
 *
 * @example
 * // After template generation with "AuthPlugin" as className:
 * import { createAuthPluginModule } from './auth-plugin.module.js';
 *
 * // In application module:
 * @Module({
 *   imports: [createAuthPluginModule({ global: true })]
 * })
 * export class AppModule {}
 *
 * @template
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import { {{className}}Service } from './{{className}}.service.js';
import { {{className}}Controller } from './{{className}}.controller.js';

/**
 * {{className}} module configuration factory
 * @param {Object} config - Module configuration
 * @param {boolean} [config.global=false] - Make module global
 * @param {Object} [config.config={}] - Module configuration
 * @param {Array} [config.providers=[]] - Additional providers
 * @param {Array} [config.exports=[]] - Additional exports
 * @returns {DynamicModule} Dynamic module configuration
 */
export function create{{className}}Module(config = {}) {
  const {
    global = false,
    config: moduleConfig = {},
    providers = [],
    exports = [],
  } = config;

  const providersConfig = [
    {
      provide: '{{constantCase}}_CONFIG',
      useValue: moduleConfig,
    },
    {{className}}Service.create(),
    ...providers,
  ];

  const moduleMetadata = {
    imports: [],
    controllers: [{{className}}Controller],
    providers: providersConfig,
    exports: [{{className}}Service, ...exports],
  };

  if (global) {
    @Global()
    @Module(moduleMetadata)
    class {{className}}DynamicModule {}
  } else {
    @Module(moduleMetadata)
    class {{className}}DynamicModule {}
  }

  return {
    module: {{className}}DynamicModule,
    providers: providersConfig,
    exports: [{{className}}Service, ...exports],
  };
}

// Re-export main components
export { {{className}}Service } from './{{className}}.service.js';
export { {{className}}Controller } from './{{className}}.controller.js';

// Default export
export default create{{className}}Module;