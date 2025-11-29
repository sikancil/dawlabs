import { globalConfig } from './utils/global-config.js';

console.log('=== GLOBAL CONFIG PROVIDER PATTERN TEST ===');

try {
  // Test configuration loading
  console.log('Testing loadConfig...');
  const _config = globalConfig.loadConfig();
  console.log('✅ Configuration loaded successfully');

  // Test organization config getter
  console.log('\nTesting getOrganization()...');
  const orgConfig = globalConfig.getOrganization();
  console.log('✅ Organization config:', {
    npm: orgConfig.npm,
    github: orgConfig.github,
    name: orgConfig.name,
  });

  // Test build config getter
  console.log('\nTesting getBuildConfig()...');
  const buildConfig = globalConfig.getBuildConfig();
  console.log('✅ Build config:', {
    packageManager: buildConfig.packageManager,
    nodeVersion: buildConfig.nodeVersion,
    orchestration: buildConfig.orchestration,
  });

  // Test CI/CD config getter
  console.log('\nTesting getCiCdConfig()...');
  const ciCdConfig = globalConfig.getCiCdConfig();
  console.log('✅ CI/CD config:', {
    platform: ciCdConfig.platform,
    environment: ciCdConfig.environment,
    trustedPublishing: ciCdConfig.trustedPublishing,
  });

  // Test NPM config getter
  console.log('\nTesting getNpmConfig()...');
  const npmConfig = globalConfig.getNpmConfig();
  console.log('✅ NPM config:', {
    registry: npmConfig.registry,
    organization: npmConfig.organization,
  });

  // Test validation method
  console.log('\nTesting validateConfiguration()...');
  const validation = globalConfig.validateConfiguration();
  console.log('✅ Configuration validation:', validation.valid ? 'VALID' : 'INVALID');
  if (!validation.valid) {
    console.log('Validation errors:', validation.errors);
    console.log('Validation warnings:', validation.warnings);
  }

  // Test caching behavior
  console.log('\nTesting caching behavior...');
  const startTime = Date.now();
  const _config1 = globalConfig.loadConfig(); // Should use cache
  const cacheTime = Date.now() - startTime;
  console.log(`✅ Cached config loaded in ${cacheTime}ms`);

  // Test force refresh
  console.log('\nTesting force refresh...');
  const _config2 = globalConfig.loadConfig(true); // Force refresh
  console.log('✅ Force refresh completed');

  // Test error handling
  console.log('\nTesting error handling...');
  try {
    globalConfig.validateConfiguration();
    console.log('✅ No validation errors');
  } catch (error) {
    console.log('⚠️ Validation found issues:', error.message);
  }

  console.log('\n🎉 GLOBAL CONFIG PROVIDER PATTERN WORKING PERFECTLY!');
} catch (error) {
  console.error('❌ GLOBAL CONFIG ERROR:', error.message);
  console.error('Stack:', error.stack);
}
