import { ConfigManager } from './utils/config-manager.js';

console.log('=== AUTO-DISCOVERY COMPREHENSIVE TEST ===');
const config = new ConfigManager(); // Auto-detect root

console.log('✅ ConfigManager created with auto-detection');
console.log('Root path:', config.rootPath);

try {
  // Test package discovery
  const packages = config.discoverPackages();
  console.log(`✅ Package discovery found ${packages.length} packages`);

  // Test configuration loading
  const identity = config.loadIdentityConfig();
  console.log('✅ Identity configuration loaded');

  // Test deployment configuration
  const _deployment = config.loadDeploymentConfig();
  console.log('✅ Deployment configuration loaded');

  // Test combined loading
  const _allConfigs = config.loadAllConfigs();
  console.log('✅ All configurations loaded successfully');

  console.log('\n=== FINAL VALIDATION ===');
  console.log('Monorepo:', identity.monorepo?.name);
  console.log('Organization:', identity.organization?.name);
  console.log('Discovered packages:', packages.length);
  console.log('Configured packages:', identity.monorepo?.discoveredPackages?.length || 0);

  // Verify package names match
  const discoveredNames = packages.map(p => p.name).sort();
  const configNames = (identity.monorepo?.discoveredPackages || []).map(p => p.name).sort();
  const match = JSON.stringify(discoveredNames) === JSON.stringify(configNames);

  console.log('Package discovery matches config:', match ? '✅' : '❌');

  if (match) {
    console.log('\n🎉 ALL TESTS PASSED - Configuration system is working correctly!');
  } else {
    console.log('\n❌ MISMATCH DETECTED:');
    console.log('Discovered:', discoveredNames);
    console.log('Configured:', configNames);
  }
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
}
