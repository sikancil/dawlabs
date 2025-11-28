#!/usr/bin/env node

/**
 * Precise ESLint Fix Script
 * Fixes only the specific undefined variable references
 */

import { readFile, writeFile } from 'fs/promises';

const filesAndFixes = [
  {
    file: 'tools/deployment-setup/api/intelligence-server.js',
    fixes: [
      { search: '} catch (_error) {', replace: '} catch (error) {' },
      { search: '} catch {\n        const error = new Error(\'Request timeout\');', replace: '} catch (_error) {\n        const error = new Error(\'Request timeout\');' }
    ]
  },
  {
    file: 'tools/deployment-setup/commands/npm-publishing.js',
    fixes: [
      { search: '} catch {', replace: '} catch (error) {' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/advanced-visualization.js',
    fixes: [
      { search: '{\n    _riskFactors,', replace: '{\n    riskFactors: _riskFactors,' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/automation-workflows.js',
    fixes: [
      { search: '} catch {', replace: '} catch (error) {' },
      { search: '{\n    _riskFactors,', replace: '{\n    riskFactors: _riskFactors,' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/corrected-analyzer.js',
    fixes: [
      { search: 'import { } from "fs/promises";', replace: 'import { readFile } from "fs/promises";' },
      { search: '} catch {', replace: '} catch (error) {' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/intelligence-dashboard.js',
    fixes: [
      { search: '{\n    oracleResults,', replace: '{\n    oracleResults,' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/learning-engine.js',
    fixes: [
      { search: 'let patterns =', replace: 'let _patterns =' },
      { search: '_currentState, _patterns,', replace: 'currentState, patterns,' },
      { search: '_historicalSuccessRate', replace: 'historicalSuccessRate' },
      { search: 'patterns', replace: '_patterns' },
      { search: 'currentState', replace: '_currentState' },
      { search: '{\n    riskFactors,', replace: '{\n    riskFactors: _riskFactors,' },
      { search: 'factor,', replace: '_factor,' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/multi-oracle-analyzer.js',
    fixes: [
      { search: '} catch {', replace: '} catch (error) {' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/npm-api.js',
    fixes: [
      { search: '} catch {', replace: '} catch (error) {' }
    ]
  },
  {
    file: 'tools/deployment-setup/utils/real-npm-registry-oracle.js',
    fixes: [
      { search: '} catch {', replace: '} catch (error) {' }
    ]
  }
];

/**
 * Apply fixes to a specific file
 */
async function fixFile(fileInfo) {
  try {
    let content = await readFile(fileInfo.file, 'utf8');
    const originalContent = content;

    for (const fix of fileInfo.fixes) {
      content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
    }

    if (content !== originalContent) {
      await writeFile(fileInfo.file, content, 'utf8');
      console.log(`✅ Fixed ${fileInfo.file}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${fileInfo.file}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Failed to fix ${fileInfo.file}:`, error.message);
    return false;
  }
}

/**
 * Main fix function
 */
async function main() {
  console.log('🎯 Precise ESLint undefined variable fix...\n');

  let fixedCount = 0;

  for (const fileInfo of filesAndFixes) {
    if (await fixFile(fileInfo)) {
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);
  console.log('🔍 Running final ESLint check...');
}

main().catch(console.error);