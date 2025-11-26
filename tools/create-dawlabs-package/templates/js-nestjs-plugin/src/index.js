/**
 * {{description}} - NestJS Plugin
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