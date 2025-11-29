import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('=== ROOT DETECTION TEST ===');

// Simulate the root detection logic
const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
console.log('Current directory:', currentDir);

const pathParts = currentDir.split('/');
console.log('Path parts:', pathParts);

// Navigate up until we find indicators of monorepo root
let rootPath = currentDir;
for (let i = 0; i < 5; i++) {
  // Go up at most 5 levels
  rootPath = pathParts.slice(0, -i).join('/');
  console.log(`Testing level ${i}: ${rootPath}`);

  const hasIdentity = existsSync(join(rootPath, '.identity.dawlabs.json'));
  const hasPNPM = existsSync(join(rootPath, 'pnpm-workspace.yaml'));
  const hasPackage = existsSync(join(rootPath, 'package.json'));

  console.log(`  .identity.dawlabs.json: ${hasIdentity}`);
  console.log(`  pnpm-workspace.yaml: ${hasPNPM}`);
  console.log(`  package.json: ${hasPackage}`);

  if (hasIdentity || hasPNPM) {
    console.log(`✅ Found monorepo root at: ${rootPath}`);
    break;
  }
}

// Test workflow file existence
const workflowPath = join(rootPath, '.github', 'workflows', 'release.yml');
console.log('\nWorkflow path:', workflowPath);
console.log('Workflow exists:', existsSync(workflowPath));
