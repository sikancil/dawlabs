/**
 * {{description}} - NestJS Plugin
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import { {{className}}Service } from './{{className}}.service';
import { {{className}}Controller } from './{{className}}.controller';

// Plugin configuration interface
export interface {{className}}ModuleConfig {
  /**
   * Enable/disable the module globally
   */
  global?: boolean;

  /**
   * Custom configuration options
   */
  config?: Record<string, unknown>;

  /**
   * Custom service providers
   */
  providers?: any[];

  /**
   * Additional exports
   */
  exports?: any[];
}

/**
 * {{className}} module configuration decorator
 */
export function create{{className}}Module(config: {{className}}ModuleConfig = {}): DynamicModule {
  const {
    global = false,
    config: customConfig = {},
    providers = [],
    exports = [],
  } = config;

  // Define module configuration
  const moduleMetadata = {
    imports: [],
    controllers: [{{className}}Controller],
    providers: [
      {
        provide: '{{constantCase}}_CONFIG',
        useValue: customConfig,
      },
      {{className}}Service,
      ...providers,
    ],
    exports: [{{className}}Service, ...exports],
  };

  // Create the appropriate module class
  if (global) {
    @Global()
    @Module(moduleMetadata)
    class Global{{className}}Module {}

    return {
      module: Global{{className}}Module,
    };
  }

  @Module(moduleMetadata)
  class {{className}}Module {}

  return {
    module: {{className}}Module,
  };
}

// Re-export main components
export { {{className}}Service } from './{{className}}.service';
export { {{className}}Controller } from './{{className}}.controller';
export * from './interfaces/index';

// Default export
export default create{{className}}Module;