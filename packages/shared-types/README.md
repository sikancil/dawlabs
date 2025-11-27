# @dawlabs/shared-types

> Centralized TypeScript type definitions and utility functions for DAWLabs
> monorepo packages.

## 🚀 Overview

This package provides shared TypeScript interfaces, error handling, and utility
functions used across all DAWLabs packages to ensure consistency, reduce code
duplication, and maintain type safety across the entire monorepo.

## 📦 Installation

```bash
pnpm add @dawlabs/shared-types
```

## 🛠️ Usage

### Importing Types

```typescript
import {
  PackageInfo,
  CLIOptions,
  CommandResult,
  NestJSModuleConfig,
  DatabaseConfig,
  DawlabsError,
} from '@dawlabs/shared-types';
```

### Importing Utilities

```typescript
import {
  createPackageInfo,
  createSuccessResult,
  createErrorResult,
} from '@dawlabs/shared-types';
```

## 📚 Available Types and Utilities

### Core Interfaces

#### `PackageInfo`

Standard package metadata interface for all DAWLabs packages.

```typescript
interface PackageInfo {
  name: string; // Package name in npm format (@dawlabs/package-name)
  version: string; // Semantic version string (e.g., "1.0.0")
  description?: string; // Optional package description
  author?: string; // Package author information
  license?: string; // Package license identifier
}
```

**Example:**

```typescript
const packageInfo: PackageInfo = {
  name: '@dawlabs/my-package',
  version: '1.0.0',
  description: 'My awesome DAWLabs package',
  author: 'Arif Widianto <https://github.com/sikancil>',
  license: 'MIT',
};
```

#### `CLIOptions`

Command-line interface options for DAWLabs CLI tools.

```typescript
interface CLIOptions {
  verbose?: boolean; // Enable verbose output
  config?: string; // Path to configuration file
  output?: string; // Output directory or file path
  dryRun?: boolean; // Execute in dry-run mode
}
```

**Example:**

```typescript
const options: CLIOptions = {
  verbose: true,
  config: './config.json',
  output: './dist',
  dryRun: false,
};
```

#### `CommandResult`

Standard result type for CLI command execution.

```typescript
interface CommandResult {
  success: boolean; // Execution success status
  message?: string; // Optional informational message
  data?: unknown; // Optional returned data payload
  error?: Error; // Error information if execution failed
}
```

**Example:**

```typescript
function executeCommand(): CommandResult {
  try {
    const result = performOperation();
    return {
      success: true,
      message: 'Operation completed successfully',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Operation failed',
      error: error as Error,
    };
  }
}
```

#### `NestJSModuleConfig`

Configuration interface for NestJS modules in DAWLabs packages.

```typescript
interface NestJSModuleConfig {
  global?: boolean; // Whether the module should be globally available
  modulePath?: string; // Custom module path for dynamic imports
}
```

**Example:**

```typescript
const moduleConfig: NestJSModuleConfig = {
  global: true,
  modulePath: './custom-module',
};
```

#### `DatabaseConfig`

Database connection configuration interface.

```typescript
interface DatabaseConfig {
  host: string; // Database server hostname or IP address
  port: number; // Database server port number
  database: string; // Database name
  username: string; // Database username
  password: string; // Database password
}
```

**Example:**

```typescript
const dbConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'password',
};
```

### Error Handling

#### `DawlabsError`

Custom error class for DAWLabs-specific errors with optional error codes and
details.

```typescript
class DawlabsError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown);
}
```

**Example:**

```typescript
function validateInput(input: unknown): void {
  if (!input) {
    throw new DawlabsError('Input is required', 'INVALID_INPUT', {
      received: input,
      expected: 'non-null value',
    });
  }
}

try {
  validateInput(null);
} catch (error) {
  if (error instanceof DawlabsError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error('Details:', error.details);
  }
}
```

### Utility Functions

#### `createPackageInfo`

Creates standardized PackageInfo objects with sensible defaults.

```typescript
function createPackageInfo(info: Partial<PackageInfo>): PackageInfo;
```

**Example:**

```typescript
// Only provide required fields, defaults are applied automatically
const packageInfo = createPackageInfo({
  name: '@dawlabs/my-package',
  version: '2.1.0',
});

// Result: { name: '@dawlabs/my-package', version: '2.1.0', author: '', ... }
```

#### `createSuccessResult`

Creates success command results with consistent structure.

```typescript
function createSuccessResult<T = unknown>(
  data?: T,
  message?: string,
): CommandResult;
```

**Example:**

```typescript
// Simple success result
const result1 = createSuccessResult();

// Success result with data
const result2 = createSuccessResult(
  { userId: 123 },
  'User created successfully',
);

// Success result with typed data
const result3 = createSuccessResult<{ id: number }>({ id: 456 });
```

#### `createErrorResult`

Creates error command results with consistent structure.

```typescript
function createErrorResult(
  error: Error | string,
  message?: string,
): CommandResult;
```

**Example:**

```typescript
// Error with message string
const result1 = createErrorResult('File not found', 'Unable to process file');

// Error with Error object
const result2 = createErrorResult(
  new Error('Network timeout'),
  'Request failed',
);
```

## 🏗️ Integration Examples

### CLI Tool Integration

```typescript
#!/usr/bin/env node

import {
  CLIOptions,
  CommandResult,
  createErrorResult,
  createSuccessResult,
} from '@dawlabs/shared-types';

interface MyCLIOptions extends CLIOptions {
  inputFile?: string;
  outputFile?: string;
}

async function runCLI(options: MyCLIOptions): Promise<CommandResult> {
  try {
    if (!options.inputFile) {
      return createErrorResult('Input file is required');
    }

    // Process file...
    const processedData = await processFile(options.inputFile);

    return createSuccessResult(
      processedData,
      `Successfully processed ${options.inputFile}`,
    );
  } catch (error) {
    return createErrorResult(error as Error, 'CLI execution failed');
  }
}
```

### NestJS Module Integration

```typescript
import { Module } from '@nestjs/common';
import { DatabaseConfig, DawlabsError } from '@dawlabs/shared-types';

@Module({})
export class DatabaseModule {
  private static config: DatabaseConfig;

  static configure(config: DatabaseConfig): void {
    if (!config.host || !config.database) {
      throw new DawlabsError(
        'Invalid database configuration',
        'INVALID_DB_CONFIG',
        { config },
      );
    }
    DatabaseModule.config = config;
  }

  static getConfig(): DatabaseConfig {
    return DatabaseModule.config;
  }
}
```

### Library Integration

```typescript
import { PackageInfo, createPackageInfo } from '@dawlabs/shared-types';

export class PackageBuilder {
  private info: PackageInfo;

  constructor(name: string, version: string) {
    this.info = createPackageInfo({ name, version });
  }

  setDescription(description: string): this {
    this.info.description = description;
    return this;
  }

  setAuthor(author: string): this {
    this.info.author = author;
    return this;
  }

  build(): PackageInfo {
    return { ...this.info };
  }
}

// Usage
const packageInfo = new PackageBuilder('@dawlabs/my-lib', '1.0.0')
  .setDescription('My awesome library')
  .setAuthor('Arif Widianto <https://github.com/sikancil>')
  .build();
```

## 🧪 Testing

This package includes comprehensive TypeScript declarations and is designed to
work seamlessly with the DAWLabs testing infrastructure.

### Type Testing

```typescript
import type { PackageInfo, CLIOptions } from '@dawlabs/shared-types';

// These will be caught by TypeScript compiler if types are incorrect
const testPackage: PackageInfo = {
  name: '@dawlabs/test',
  version: '1.0.0',
  // TypeScript will warn if required fields are missing
};

const testOptions: CLIOptions = {
  verbose: true,
  dryRun: false,
};
```

## 📝 Best Practices

1. **Consistent Error Handling**: Always use `DawlabsError` for DAWLabs-specific
   errors
2. **Standardized Results**: Use `createSuccessResult` and `createErrorResult`
   for CLI operations
3. **Type Safety**: Leverage TypeScript interfaces for compile-time validation
4. **Documentation**: Document any new types or utilities added to this package
5. **Versioning**: Update this package version when making breaking changes

## 🔗 Dependencies

- **TypeScript 5.9.2+**: Required for type checking and declarations
- **No runtime dependencies**: Pure type definitions and utilities

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Follow the existing code style and documentation patterns
2. Add comprehensive JSDoc comments for new types and functions
3. Include usage examples in documentation
4. Update this README when adding new features
5. Ensure backward compatibility for version updates

---

**Built with ❤️ by [DAWLabs Team](https://github.com/sikancil/dawlabs)**
