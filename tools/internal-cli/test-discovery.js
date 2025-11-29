import { ConfigManager } from './utils/config-manager.js';
const config = new ConfigManager('../..');

console.log('=== PACKAGE DISCOVERY TEST WITH CORRECT PATH ===');
try {
  const packages = config.discoverPackages();
  console.log('✅ Package discovery successful');
  console.log('Discovered packages:');
  packages.forEach((pkg, i) => {
    console.log(`  ${i + 1}. ${pkg.name}@${pkg.version} (${pkg.type}) - ${pkg.path}`);
  });
  console.log(`\nTotal: ${packages.length} packages`);

  // Compare with configuration
  const identity = config.loadIdentityConfig();
  const configPackages = identity.monorepo?.discoveredPackages || [];
  console.log(`\nConfigured packages: ${configPackages.length}`);

  // Check for mismatches
  const discoveredNames = packages.map(p => p.name).sort();
  const configNames = configPackages.map(p => p.name).sort();
  const missing = configNames.filter(name => !discoveredNames.includes(name));
  const extra = discoveredNames.filter(name => !configNames.includes(name));

  if (missing.length > 0 || extra.length > 0) {
    console.log('\n❌ PACKAGE DISCOVERY MISMATCH:');
    if (missing.length > 0) console.log('  Missing in discovery:', missing);
    if (extra.length > 0) console.log('  Extra in discovery:', extra);
  } else {
    console.log('\n✅ Package discovery matches configuration perfectly');
  }
} catch (error) {
  console.error('❌ Failed to discover packages:', error.message);
  console.error('Stack:', error.stack);
}
