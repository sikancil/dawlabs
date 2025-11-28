#!/usr/bin/env node

/**
 * Targeted ESLint Fix Script
 * Fixes only the specific remaining no-undef errors
 */

import { readFile, writeFile } from 'fs/promises';

const filesToFix = [
  'tools/deployment-setup/api/intelligence-server.js',
  'tools/deployment-setup/commands/npm-publishing.js',
  'tools/deployment-setup/utils/advanced-visualization.js',
  'tools/deployment-setup/utils/automation-workflows.js',
  'tools/deployment-setup/utils/corrected-analyzer.js',
  'tools/deployment-setup/utils/intelligence-dashboard.js',
  'tools/deployment-setup/utils/learning-engine.js',
  'tools/deployment-setup/utils/multi-oracle-analyzer.js',
  'tools/deployment-setup/utils/npm-api.js',
  'tools/deployment-setup/utils/real-npm-registry-oracle.js'
];

/**
 * Fix specific no-undef errors in a file
 */
async function fixSpecificErrors(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;

    // Fix catch block errors - add error parameter
    content = content
      .replace(/} catch \{ \n/g, '} catch (error) {\n')
      .replace(/} catch \{ /g, '} catch (error) {')
      .replace(/console\.log\(error\.message\);/g, 'console.log(error.message);')
      .replace(/throw error;/g, 'throw error;');

    // Fix specific undefined variables in catch blocks
    if (filePath.includes('intelligence-server.js')) {
      content = content
        .replace(/} catch \{ \n      res\.status\(500\)\.json\(\{ error: 'Internal server error' \}\);/g, '} catch (error) {\n      res.status(500).json({ error: \'Internal server error\' });')
        .replace(/console\.error\(\'Request error:\', error\);/g, 'console.error(\'Request error:\', error);');
    }

    if (filePath.includes('npm-publishing.js')) {
      content = content
        .replace(/} catch \{ \n      console\.error\(\'Command failed:\', error\);/g, '} catch (error) {\n      console.error(\'Command failed:\', error);');
    }

    if (filePath.includes('corrected-analyzer.js')) {
      // Fix the readFile import issue
      content = content.replace(/import \{ \} from "fs\/promises";/g, 'import { readFile } from "fs/promises";');
    }

    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed no-undef errors in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main fix function
 */
async function main() {
  console.log('🎯 Targeted ESLint no-undef error fix...\n');

  let fixedCount = 0;

  for (const file of filesToFix) {
    if (await fixSpecificErrors(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed no-undef errors in ${fixedCount} files`);
  console.log('🔍 Running ESLint check...');
}

main().catch(console.error);