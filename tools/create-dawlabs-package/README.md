# DAWLabs Package Generator CLI

> A powerful CLI tool for scaffolding DAWLabs packages with comprehensive template support for both JavaScript and TypeScript projects.

## 🚀 Overview

The `create-dawlabs-package` CLI is a comprehensive package generator that creates standardized boilerplate code for various types of DAWLabs packages. It supports 12 different package templates with built-in build configurations, testing setups, and development workflows.

## 📦 Installation

### Global Installation
```bash
npm install -g @dawlabs/create-package
# or
pnpm add -g @dawlabs/create-package
```

### npx Usage (Recommended)
```bash
npx @dawlabs/create-package <type> <name>
```

### Local Usage (In Monorepo)
```bash
node tools/create-dawlabs-package/index.js <type> <name>
```

### Short Alias
```bash
npx dawlabs <type> <name>
```

## 🛠️ Available Package Templates

### JavaScript Templates

| Type | Description | Build Config |
|------|-------------|--------------|
| `cli-tool` | CLI tool with executable output | `build.config.cli.js` |
| `js-nestjs-app` | NestJS application (JavaScript) | `build.config.nestjs.js` |
| `js-nestjs-plugin` | NestJS plugin/module package (JavaScript) | `build.config.nestjs.js` |
| `node-lib` | Node.js library for server-side packages (JavaScript) | `build.config.node.js` |
| `browser-lib` | Browser library for frontend packages (JavaScript) | `build.config.browser.js` |
| `js` | Pure JavaScript library | `build.config.js.js` |

### TypeScript Templates

| Type | Description | Build Config |
|------|-------------|--------------|
| `nestjs-app` | NestJS application (TypeScript) | `build.config.nestjs.js` |
| `nestjs-plugin` | NestJS plugin/module package (TypeScript) | `build.config.nestjs.js` |
| `ts-cli-tool` | CLI tool with executable output (TypeScript) | `build.config.cli.js` |
| `ts-node-lib` | Node.js library for server-side packages (TypeScript) | `build.config.node.js` |
| `ts-browser-lib` | Browser library for frontend packages (TypeScript) | `build.config.browser.js` |
| `ts` | TypeScript library with full type safety | `build.config.ts.js` |

## 🚀 Usage

### Basic Usage
```bash
create-dawlabs-package <type> <name>
```

### Examples
```bash
# Create a CLI tool (TypeScript)
create-dawlabs-package ts-cli-tool my-awesome-cli

# Create a NestJS application (TypeScript)
create-dawlabs-package nestjs-app my-api

# Create a utility library (JavaScript)
create-dawlabs-package node-lib my-utils

# Create a browser library (TypeScript)
create-dawlabs-package ts-browser-lib my-ui-lib

# Create a NestJS plugin (JavaScript)
create-dawlabs-package js-nestjs-plugin my-nestjs-module

# Create a pure TypeScript library
create-dawlabs-package ts my-ts-lib
```

### Advanced Options

```bash
create-dawlabs-package <type> <name> [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--packages-dir <dir>` | Custom packages directory | `packages` |
| `--description <text>` | Custom package description | Auto-generated |
| `--author <email>` | Package author email | `arif@dawlabs.dev` |
| `--help` | Show help information | - |

#### Example with Options
```bash
create-dawlabs-package ts-node-lib my-utils \
  --packages-dir "packages" \
  --description "My utility library for DAWLabs" \
  --author "my-email@example.com"
```

## 🏗️ Template Features

### Built-in Features

All templates include:

- **Modern Build System**: Configured with tsup for fast builds
- **Testing Setup**: Jest with proper ES module support
- **Linting**: ESLint v9 with flat configuration format
- **Code Formatting**: Prettier with consistent style
- **TypeScript Support**: Strict type checking (for TS templates)
- **Development Scripts**: Common npm scripts for development workflow
- **VSCode Integration**: Editor settings and recommendations (TypeScript packages)

### NestJS Templates

Both TypeScript and JavaScript NestJS templates include:

- **Decorator Support**: Proper experimental decorators configuration
- **Module Structure**: Standard NestJS module layout
- **Testing Framework**: NestJS testing utilities
- **Build Optimization**: Optimized for server deployment
- **Configuration Management**: Environment-based configuration

### Browser Library Templates

- **Universal Module Definition (UMD)**: Works with CommonJS, AMD, and global
- **Type Declarations**: TypeScript definitions included
- **Bundle Optimization**: Tree-shakable exports
- **Development Setup**: Development server with hot reload

### CLI Tool Templates

- **Executable Binaries**: Proper shebang and executable permissions
- **Command Parsing**: Commander.js for robust CLI argument handling
- **Help System**: Automatic help generation
- **Error Handling**: Graceful error handling and user feedback

## 📁 Package Structure

Generated packages follow this structure:

```
packages/
└── my-package/
    ├── src/
    │   ├── index.ts           # Main entry point
    │   ├── index.test.ts      # Unit tests
    │   └── ...               # Package-specific files
    ├── .vscode/
    │   └── settings.json     # Editor settings (TypeScript packages)
    ├── package.json          # Package configuration
    ├── tsconfig.json         # TypeScript configuration (TypeScript packages)
    ├── tsup.config.ts        # Build configuration
    ├── jest.config.js        # Testing configuration
    ├── README.md             # Package documentation
    └── .eslintignore         # ESLint ignore patterns
```

## 🛠️ Development Workflow

After creating a package:

1. **Navigate to the package directory**:
   ```bash
   cd packages/my-package
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

4. **Run tests**:
   ```bash
   pnpm test
   ```

5. **Build for production**:
   ```bash
   pnpm build
   ```

6. **Lint and fix**:
   ```bash
   pnpm lint:fix
   ```

## 📝 Template Variables

The CLI automatically replaces the following variables in templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | Package name (kebab-case) | `my-package` |
| `{{className}}` | Package name (PascalCase) | `MyPackage` |
| `{{camelCase}}` | Package name (camelCase) | `myPackage` |
| `{{snakeCase}}` | Package name (snake_case) | `my_package` |
| `{{constantCase}}` | Package name (CONSTANT_CASE) | `MY_PACKAGE` |
| `{{packageName}}` | Full npm package name | `@dawlabs/my-package` |
| `{{description}}` | Package description | Custom or auto-generated |
| `{{author}}` | Package author | `arif@dawlabs.dev` |
| `{{type}}` | Package type identifier | `ts-node-lib` |

## 🚨 Experimental Features

### JavaScript NestJS Support

JavaScript NestJS templates (`js-nestjs-app`, `js-nestjs-plugin`) are marked as experimental because:

- They rely on runtime decorator support via the monorepo infrastructure
- They use the existing TypeScript configuration for decorator support
- Build warnings may appear during compilation

These templates are fully functional but require careful testing when used in production environments.

## 🔧 Configuration Files

The CLI uses several configuration files for template generation:

- **Build Configs**: Located in `/config/build.config.*.js`
- **TypeScript Configs**: Located in `/config/tsconfig.*.json`
- **ESLint Configs**: Located in `/config/eslint.*.js`

These files are automatically selected based on the package type and provide optimal default settings for each type of package.

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the CLI has execute permissions
2. **Template Not Found**: Verify all configuration files are present in `/config/`
3. **Build Failures**: Check that all dependencies are installed with `pnpm install`
4. **TypeScript Errors**: Ensure TypeScript templates have proper configuration

### Getting Help

```bash
# Show all available package types and options
create-dawlabs-package --help

# Show specific help for a package type
create-dawlabs-package <type> --help
```

## 🤝 Contributing

To add new package templates or modify existing ones:

1. Navigate to `/tools/create-dawlabs-package/templates/`
2. Create a new template directory following the naming convention
3. Add template configuration to `PACKAGE_TYPES` in `index.js`
4. Create appropriate build configuration in `/config/`
5. Test the new template thoroughly

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Links

- [DAWLabs Monorepo](https://github.com/dawlabs/arifwidianto)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [tsup Documentation](https://tsup.egoist.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [ESLint v9 Documentation](https://eslint.org/docs/latest/)

---

**Built with ❤️ by [DAWLabs Team](https://github.com/dawlabs)**