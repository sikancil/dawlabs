import { globalConfig } from './utils/global-config.js';
import { existsSync } from 'fs';

console.log('=== CONFIGURATION VALIDATION TEST ===');

try {
  // Test individual config loading
  console.log('1. Testing individual config loading...');

  const config = globalConfig.loadConfig();
  console.log('   ✅ loadConfig() successful');
  console.log('   Identity loaded:', !!config.identity);
  console.log('   Deployment loaded:', !!config.deployment);

  // Test validation method directly
  console.log('\n2. Testing validateConfiguration()...');

  try {
    const result = globalConfig.validateConfiguration();
    console.log('   ✅ Validation result:', result);
  } catch (validationError) {
    console.log('   ❌ Validation failed:', validationError.message);
  }

  // Test if config files exist
  console.log('\n3. Testing file existence...');
  const identityPath =
    '/Users/dimasarif/DATA/DAW/Development/NodePackages/arifwidianto/.identity.dawlabs.json';
  const deploymentPath =
    '/Users/dimasarif/DATA/DAW/Development/NodePackages/arifwidianto/tools/internal-cli/config/deployment.json';

  console.log('   Identity file exists:', existsSync(identityPath));
  console.log('   Deployment file exists:', existsSync(deploymentPath));

  // Test config content
  console.log('\n4. Testing config content...');

  if (config.identity) {
    console.log('   ✅ Identity has monorepo:', !!config.identity.monorepo);
    console.log('   ✅ Identity has organization:', !!config.identity.organization);
    console.log('   ✅ Monorepo name:', config.identity.monorepo?.name);
  }

  if (config.deployment) {
    console.log('   ✅ Deployment loaded successfully');
    console.log('   Deployment keys:', Object.keys(config.deployment));
  }
} catch (error) {
  console.error('❌ VALIDATION TEST ERROR:', error.message);
  console.error('Stack:', error.stack);
}
