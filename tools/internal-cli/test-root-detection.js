import { ConfigManager } from './utils/config-manager.js';

console.log('=== MONOREPO ROOT DETECTION TEST ===');
console.log('Current working directory:', process.cwd());

// Test from subdirectory
const detectedRoot = ConfigManager.detectMonorepoRoot();
console.log('Detected monorepo root:', detectedRoot);

// Test config manager with auto-detection
const config = new ConfigManager();
console.log('ConfigManager root path:', config.rootPath);
console.log('ConfigManager identity path:', config.identityPath);

// Test if files exist
import { existsSync } from 'fs';
console.log('Identity config exists:', existsSync(config.identityPath));
console.log('Example config exists:', existsSync(config.identityExamplePath));

// Test loading
try {
  const identity = config.loadIdentityConfig();
  console.log('✅ Successfully loaded identity config');
  console.log('Monorepo name:', identity.monorepo?.name);
  console.log('Package count:', identity.monorepo?.discoveredPackages?.length || 0);
} catch (error) {
  console.error('❌ Failed to load identity config:', error.message);
}
