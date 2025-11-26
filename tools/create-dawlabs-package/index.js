#!/usr/bin/env node

import { join, dirname } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, 'templates');

const PACKAGE_TYPES = {
  'cli-tool': {
    description: 'CLI tool with executable output (JavaScript)',
    template: 'js-cli-tool',
    buildConfig: 'build.config.cli.js',
  },
  'nestjs-app': {
    description: 'NestJS application (TypeScript)',
    template: 'ts-nestjs-app',
    buildConfig: 'build.config.nestjs.js',
  },
  'node-lib': {
    description: 'Node.js library for server-side packages (JavaScript)',
    template: 'js-node-lib',
    buildConfig: 'build.config.node.js',
  },
  'browser-lib': {
    description: 'Browser library for frontend packages (JavaScript)',
    template: 'js-browser-lib',
    buildConfig: 'build.config.browser.js',
  },
  js: {
    description: 'Pure JavaScript library',
    template: 'js',
    buildConfig: 'build.config.js.js',
  },
  ts: {
    description: 'TypeScript library with full type safety',
    template: 'ts',
    buildConfig: 'build.config.ts.js',
  },
  'js-nestjs-app': {
    description: 'NestJS application (JavaScript)',
    template: 'js-nestjs-app',
    buildConfig: 'build.config.nestjs.js',
  },
  'ts-cli-tool': {
    description: 'CLI tool with executable output (TypeScript)',
    template: 'ts-cli-tool',
    buildConfig: 'build.config.cli.js',
  },
  'ts-node-lib': {
    description: 'Node.js library for server-side packages (TypeScript)',
    template: 'ts-node-lib',
    buildConfig: 'build.config.node.js',
  },
  'ts-browser-lib': {
    description: 'Browser library for frontend packages (TypeScript)',
    template: 'ts-browser-lib',
    buildConfig: 'build.config.browser.js',
  },
  'nestjs-plugin': {
    description: 'NestJS plugin/module package (TypeScript)',
    template: 'ts-nestjs-plugin',
    buildConfig: 'build.config.nestjs-plugin.js',
  },
  'js-nestjs-plugin': {
    description: 'NestJS plugin/module package (JavaScript)',
    template: 'js-nestjs-plugin',
    buildConfig: 'build.config.nestjs-plugin.js',
  },
};

function usage() {
  console.log(`
Usage: create-dawlabs-package <type> <name> [options]

Package Types:
${Object.entries(PACKAGE_TYPES)
  .map(([key, value]) => `    ${key.padEnd(12)} ${value.description}`)
  .join('\n')}

Examples:
  create-dawlabs-package cli-tool my-cli
  create-dawlabs-package nestjs-app my-api
  create-dawlabs-package node-lib my-utils
  create-dawlabs-package browser-lib my-ui-lib
  create-dawlabs-package js my-js-lib
  create-dawlabs-package ts my-ts-lib
  create-dawlabs-package nestjs-plugin my-nestjs-module

Options:
  --packages-dir <dir>  Packages directory (default: packages)
  --description <text>   Package description
  --author <email>      Author email (default: arif@dawlabs.dev)
  --help              Show this help
`);
}

function createPackage(type, name, options = {}) {
  const packageType = PACKAGE_TYPES[type];
  if (!packageType) {
    console.error(`❌ Unknown package type: ${type}`);
    console.error(`Available types: ${Object.keys(PACKAGE_TYPES).join(', ')}`);
    process.exit(1);
  }

  // Validate package name
  if (!name) {
    console.error('❌ Package name is required');
    process.exit(1);
  }

  const packageName = `@dawlabs/${name}`;
  const packageDir = join(process.cwd(), options.packagesDir || 'packages', name);

  console.log(`🚀 Creating ${packageName} (${type})...`);

  // Create package directory
  if (existsSync(packageDir)) {
    console.error(`❌ Package directory already exists: ${packageDir}`);
    process.exit(1);
  }

  mkdirSync(packageDir, { recursive: true });

  // Load template
  const templateDir = join(TEMPLATES_DIR, packageType.template);
  if (!existsSync(templateDir)) {
    console.error(`❌ Template not found: ${templateDir}`);
    process.exit(1);
  }

  // Generate multiple case variations of the name
  const nameVariations = {
    // Original name in kebab-case
    name,
    // PascalCase (e.g., my-cool-package -> MyCoolPackage)
    className: name.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase()),
    // camelCase (e.g., my-cool-package -> myCoolPackage)
    camelCase: name
      .replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, letter => letter.toLowerCase()),
    // snake_case (e.g., my-cool-package -> my_cool_package)
    snakeCase: name.replace(/-/g, '_'),
    // CONSTANT_CASE (e.g., my-cool-package -> MY_COOL_PACKAGE)
    constantCase: name.replace(/-/g, '_').toUpperCase(),
  };

  // Copy template files
  copyTemplate(templateDir, packageDir, {
    packageName,
    ...nameVariations,
    description: options.description || `DAWLabs ${name} package`,
    author: options.author || 'arif@dawlabs.dev',
    type,
  });

  // Create VSCode settings for TypeScript packages to resolve tsconfig conflicts
  if (
    type.startsWith('ts-') ||
    type === 'ts' ||
    type === 'nestjs-app' ||
    type === 'nestjs-plugin'
  ) {
    createVSCodeSettings(packageDir);
  }

  console.log(`✅ Package created: ${packageDir}`);
  console.log('\nNext steps:');
  console.log(`  cd ${packageDir}`);
  console.log('  pnpm install');
  console.log('  pnpm dev');
}

function copyTemplate(templateDir, packageDir, vars) {
  const templateFiles = getAllFiles(templateDir);

  templateFiles.forEach(file => {
    const relativePath = file.replace(templateDir, '');

    // Process template variables in file path
    let processedRelativePath = relativePath;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedRelativePath = processedRelativePath.replace(regex, value);
    });

    const targetPath = join(packageDir, processedRelativePath);

    // Create directory if needed
    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Read template content
    const templateContent = readFileSync(file, 'utf8');

    // Replace template variables
    let content = templateContent;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value);
    });

    // Write file
    writeFileSync(targetPath, content);
  });
}

function createVSCodeSettings(packageDir) {
  const vscodeDir = join(packageDir, '.vscode');
  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true });
  }

  const settings = {
    'typescript.preferences.includePackageJsonAutoImports': 'auto',
    'typescript.suggest.autoImports': true,
    'typescript.workspaceSymbols.scope': 'allOpenProjects',
    'typescript.tsserver.experimental.enableProjectDiagnostics': false,
  };

  const settingsPath = join(vscodeDir, 'settings.json');
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);

  items.forEach(item => {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  });

  return files;
}

// CLI handler
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  if (args.length < 2) {
    console.error('❌ Missing required arguments');
    usage();
    process.exit(1);
  }

  const type = args[0];
  const name = args[1];

  // Parse options
  const options = {};
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (value && !value.startsWith('--')) {
      options[key] = value;
    }
  }

  createPackage(type, name, options);
}

// Run CLI - Robust check for when this file is executed directly or via binary
const isMainModule = () => {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const executedFile = process.argv[1];

    // Method 1: Direct file comparison (most reliable)
    if (currentFile === executedFile) {
      return true;
    }

    // Method 2: Check if executed file is a binary that points to this file
    // This handles npx/bunx symlinks and package managers
    const pathSeparator = process.platform === 'win32' ? '\\' : '/';
    const executedFileName = executedFile.split(pathSeparator).pop();
    const currentFileName = currentFile.split(pathSeparator).pop();

    // Check if the executed file is a known binary name and current file is index.js
    if (
      (executedFileName === 'create-dawlabs-package' || executedFileName === 'dawlabs') &&
      currentFileName === 'index.js'
    ) {
      return true;
    }

    // Method 3: Fallback - check if this is the main module
    if (import.meta.url === `file://${executedFile}`) {
      return true;
    }

    // Method 4: Additional fallback - normalize paths and compare
    const normalizePath = path => {
      return path.replace(/^\/private\//, '/');
    };

    if (normalizePath(currentFile) === normalizePath(executedFile)) {
      return true;
    }

    return false;
  } catch {
    // If anything fails, fall back to basic check
    return import.meta.url === `file://${process.argv[1]}`;
  }
};

if (isMainModule()) {
  main();
}

export { createPackage, PACKAGE_TYPES };
