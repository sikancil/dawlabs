#!/usr/bin/env node

/**
 * DAWLabs Package Generator CLI
 *
 * A powerful CLI tool for scaffolding DAWLabs packages with comprehensive
 * template support for both JavaScript and TypeScript projects.
 *
 * @author DAWLabs Team
 * @version 1.0.0
 * @license MIT
 */

import { resolve, join, dirname } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';

/** @type {string} Absolute path to current directory */
const __filename = fileURLToPath(import.meta.url);
/** @type {string} Directory containing the CLI tool */
const __dirname = dirname(__filename);
/** @type {string} Directory containing package templates */
const TEMPLATES_DIR = join(__dirname, 'templates');

/**
 * Package type configuration mapping
 * Defines all available package templates with their descriptions, template directories,
 * and build configuration files. This enables the CLI to scaffold different types of packages
 * with appropriate tooling and configurations.
 *
 * @typedef {Object} PackageType
 * @property {string} description - Human-readable description of the package type
 * @property {string} template - Directory name of the template to use
 * @property {string} buildConfig - Build configuration file name (null if not applicable)
 */

/** @type {Record<string, PackageType>} Available package types for scaffolding */
const PACKAGE_TYPES = {
  // JavaScript Templates
  'cli-tool': {
    description: 'CLI tool with executable output (JavaScript)',
    template: 'js-cli-tool',
    buildConfig: 'build.config.cli.js',
  },
  'js-nestjs-app': {
    description: 'NestJS application (JavaScript)',
    template: 'js-nestjs-app',
    buildConfig: 'build.config.nestjs.js',
  },
  'js-nestjs-plugin': {
    description: 'NestJS plugin/module package (JavaScript)',
    template: 'js-nestjs-plugin',
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

  // TypeScript Templates
  'nestjs-app': {
    description: 'NestJS application (TypeScript)',
    template: 'ts-nestjs-app',
    buildConfig: 'build.config.nestjs.js',
  },
  'nestjs-plugin': {
    description: 'NestJS plugin/module package (TypeScript)',
    template: 'ts-nestjs-plugin',
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
  ts: {
    description: 'TypeScript library with full type safety',
    template: 'ts',
    buildConfig: 'build.config.ts.js',
  },
};

/**
 * Displays usage information and available package types
 *
 * This function prints a comprehensive help message showing the CLI usage syntax,
 * all available package types with descriptions, example commands, and available options.
 * The output is formatted for readability and provides users with clear guidance on
 * how to use the package generator.
 */
function usage() {
  console.log(`
Usage: create-dawlabs-package <type> <name> [options]

Package Types:
${Object.entries(PACKAGE_TYPES)
  .map(([key, value]) => `  ${key.padEnd(12)} ${value.description}`)
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

/**
 * Creates a new package from a template
 *
 * This is the main function that orchestrates the package creation process. It validates
 * the input parameters, creates the package directory, copies and processes template files,
 * and provides user feedback. The function handles error cases gracefully and provides
 * clear error messages to guide users.
 *
 * @param {string} type - The package type identifier (must exist in PACKAGE_TYPES)
 * @param {string} name - The name for the new package (used in directory and package name)
 * @param {Object} [options={}] - Optional configuration options
 * @param {string} [options.packagesDir='packages'] - Directory where packages are created
 * @param {string} [options.description] - Package description (auto-generated if not provided)
 * @param {string} [options.author='arif@dawlabs.dev'] - Package author email
 * @throws {Error} When package type is invalid or directory conflicts occur
 */
function createPackage(type, name, options = {}) {
  // Validate package type exists
  const packageType = PACKAGE_TYPES[type];
  if (!packageType) {
    console.error(`❌ Unknown package type: ${type}`);
    console.error(`Available types: ${Object.keys(PACKAGE_TYPES).join(', ')}`);
    process.exit(1);
  }

  // Validate package name is provided
  if (!name) {
    console.error('❌ Package name is required');
    process.exit(1);
  }

  // Construct package metadata
  const packageName = `@dawlabs/${name}`;
  const packageDir = join(process.cwd(), options.packagesDir || 'packages', name);

  console.log(`🚀 Creating ${packageName} (${type})...`);

  // Prevent overwriting existing packages
  if (existsSync(packageDir)) {
    console.error(`❌ Package directory already exists: ${packageDir}`);
    process.exit(1);
  }

  // Ensure package directory exists
  mkdirSync(packageDir, { recursive: true });

  // Validate template directory exists
  const templateDir = join(TEMPLATES_DIR, packageType.template);
  if (!existsSync(templateDir)) {
    console.error(`❌ Template not found: ${templateDir}`);
    process.exit(1);
  }

  // Generate name variations for template processing
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

  // Copy and process template files with variable substitution
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
  console.log(`\nNext steps:`);
  console.log(`  cd ${packageDir}`);
  console.log(`  pnpm install`);
  console.log(`  pnpm dev`);
}

/**
 * Copies template files to the target package directory with variable substitution
 *
 * This function recursively processes all files in a template directory, copies them to the
 * target package directory, and performs variable substitution using a {{variable}} syntax.
 * It maintains the directory structure and processes both file paths and file content.
 *
 * @param {string} templateDir - Source directory containing template files
 * @param {string} packageDir - Target directory where the package will be created
 * @param {Object} vars - Variables to substitute in template files
 * @param {string} vars.packageName - Full package name (e.g., @dawlabs/my-package)
 * @param {string} vars.name - Package name in kebab-case
 * @param {string} vars.className - Package name in PascalCase
 * @param {string} vars.camelCase - Package name in camelCase
 * @param {string} vars.snakeCase - Package name in snake_case
 * @param {string} vars.constantCase - Package name in CONSTANT_CASE
 * @param {string} vars.description - Package description
 * @param {string} vars.author - Package author email
 * @param {string} vars.type - Package type identifier
 */
function copyTemplate(templateDir, packageDir, vars) {
  const templateFiles = getAllFiles(templateDir);

  templateFiles.forEach(file => {
    // Calculate relative path from template directory
    const relativePath = file.replace(templateDir, '');

    // Process template variables in file path
    let processedRelativePath = relativePath;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedRelativePath = processedRelativePath.replace(regex, value);
    });

    const targetPath = join(packageDir, processedRelativePath);

    // Ensure target directory exists
    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Read and process template file content
    const templateContent = readFileSync(file, 'utf8');

    // Replace template variables in content
    let content = templateContent;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value);
    });

    // Write processed file to target location
    writeFileSync(targetPath, content);
  });
}

/**
 * Recursively collects all files from a directory
 *
 * This utility function traverses a directory tree and collects paths to all files.
 * It uses synchronous file system operations to ensure all files are processed
 * before the function returns.
 *
 * @param {string} dir - Directory to traverse
 * @param {string[]} [files=[]] - Accumulator array for found file paths
 * @returns {string[]} Array of absolute file paths found in the directory tree
 */
function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);

  items.forEach(item => {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    // Recursively process subdirectories
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      // Add file path to results
      files.push(fullPath);
    }
  });

  return files;
}

/**
 * Creates VSCode settings for TypeScript packages to resolve tsconfig conflicts
 *
 * When multiple TypeScript packages exist in a monorepo, VSCode may have difficulty
 * determining which tsconfig.json file to use. This function creates VSCode-specific
 * settings that help resolve these conflicts by prioritizing the local package's tsconfig.json
 * and providing clear TypeScript preferences.
 *
 * @param {string} packageDir - Directory path of the created package
 */
function createVSCodeSettings(packageDir) {
  const vscodeDir = join(packageDir, '.vscode');
  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true });
  }

  const settings = {
    'typescript.preferences.includePackageJsonAutoImports': 'on',
    'typescript.suggest.autoImports': true,
    'typescript.preferences.importModuleSpecifier': 'relative',
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
    },
  };

  writeFileSync(join(vscodeDir, 'settings.json'), JSON.stringify(settings, null, 2));
}

/**
 * Main CLI handler and entry point
 *
 * This function serves as the main entry point when the CLI is executed.
 * It parses command line arguments, handles help requests, validates input,
 * and delegates to the appropriate functions for package creation.
 *
 * @throws {Error} When invalid arguments are provided
 */
function main() {
  const args = process.argv.slice(2);

  // Handle help request
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  // Validate required arguments
  if (args.length < 2) {
    console.error('❌ Missing required arguments');
    usage();
    process.exit(1);
  }

  const type = args[0];
  const name = args[1];

  // Parse command line options with proper validation
  const options = {};
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--packages-dir':
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options.packagesDir = args[i + 1];
          i++;
        } else {
          console.error('❌ Error: --packages-dir requires a value');
          process.exit(1);
        }
        break;
      case '--description':
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options.description = args[i + 1];
          i++;
        } else {
          console.error('❌ Error: --description requires a value');
          process.exit(1);
        }
        break;
      case '--author':
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options.author = args[i + 1];
          i++;
        } else {
          console.error('❌ Error: --author requires a value');
          process.exit(1);
        }
        break;
      default:
        console.error(`❌ Unknown option: ${args[i]}`);
        console.error('Use --help for available options');
        process.exit(1);
    }
  }

  // Execute package creation with validated options
  createPackage(type, name, options);
}

// Execute CLI handler when run directly (not imported as module)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for programmatic usage
export { createPackage, PACKAGE_TYPES };
