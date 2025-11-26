# DAWLabs Monorepo

> A modern monorepo for all DAWLabs tools, libraries, scripts, and CLI commands
> published under the `@dawlabs` npm scope.

## 🚀 Overview

This monorepo uses the following stack:

- **Turborepo** - High-performance build system for monorepos
- **pnpm** - Fast, disk space efficient package manager with workspace support
- **Changesets** - Automated versioning and publishing workflow
- **TypeScript** - Type-safe development across all packages
- **ESLint + Prettier** - Consistent code quality and formatting
- **Husky + lint-staged** - Pre-commit git hooks

## 📁 Structure

```
dawlabs/
├── .changeset/           # Changesets configuration and change files
├── .github/workflows/    # CI/CD workflows for automated testing and publishing
├── .husky/               # Git hooks
├── apps/                 # Demo applications and examples
├── packages/             # Publishable packages
│   ├── cli-tools/        # CLI commands and tools
│   ├── utils/            # Utility libraries
│   ├── config-tools/     # Configuration tools
│   └── shared-types/     # Shared TypeScript types
├── tools/                # Internal build/publish scripts
├── package.json          # Root package configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── turbo.json            # Turborepo configuration
└── README.md
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm 9.0.0+

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/dawlabs/arifwidianto.git
cd arifwidianto
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development:

```bash
pnpm dev
```

### Available Scripts

#### Development Commands

- `pnpm dev` - Start development mode for all packages
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Lint and fix issues in all packages
- `pnpm check-types` - Type check all packages
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check if code is properly formatted

#### Testing Commands

- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage reporting

#### Release Commands

- `pnpm changeset` - Add a changeset for version changes
- `pnpm version-packages` - Apply version changes based on changesets
- `pnpm release` - Build and publish packages to NPM

#### Utility Commands

- `pnpm clean` - Clean build artifacts
- `pnpm clean:all` - Deep clean including all node_modules

## 📦 Publishing Workflow

This monorepo uses Changesets for automated versioning and publishing:

1. **Make changes** to any packages
2. **Add a changeset**: `pnpm changeset`
   - Select packages that changed
   - Choose version bump type (patch, minor, major)
   - Add a description of changes
3. **Create a PR** with your changes
4. **Version bump**: Once PR is merged, a "Version Packages" PR is automatically
   created
5. **Publish**: When the version PR is merged, packages are automatically
   published to NPM

### Adding New Packages

1. Create a new directory in `packages/` or `apps/`
2. Initialize with `package.json` using the `@dawlabs/*` scope
3. Add to `pnpm-workspace.yaml` if needed
4. Configure in `turbo.json` for build tasks

Example package.json for a new package:

```json
{
  "name": "@dawlabs/my-new-package",
  "version": "0.0.1",
  "description": "A new DAWLabs package",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "keywords": ["dawlabs"],
  "author": "Arif Widiyanto <arif@dawlabs.dev>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

## 🏗️ Build System

Turborepo provides intelligent caching and parallel execution:

- **Dependency-aware**: Packages only build after their dependencies
- **Caching**: Build results are cached locally and can be shared via remote
  caching
- **Parallel execution**: Independent packages build simultaneously
- **Incremental builds**: Only changed packages are rebuilt

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `NPM_TOKEN` - NPM authentication token (for publishing)
- `TURBO_TOKEN` - Turborepo remote caching token (optional)

### GitHub Actions Setup

To enable automated publishing:

1. Add `NPM_TOKEN` to repository secrets
2. Configure repository settings to allow GitHub Actions to create PRs
3. Ensure your NPM account has access to publish under `@dawlabs` scope

## 📚 Guidelines

### Code Standards

- All code must be written in TypeScript
- Use ESLint and Prettier configurations
- Follow conventional commit messages
- Add appropriate JSDoc comments for public APIs
- Include tests for new functionality

### Package Development

- Use `workspace:*` protocol for internal dependencies
- Prefer ESM modules with CommonJS compatibility
- Include proper `exports` field in package.json
- Use semantic versioning with Changesets
- Add comprehensive README.md for complex packages

### Publishing Standards

- All packages are scoped under `@dawlabs`
- Use public access (`"access": "public"`)
- Include proper keywords for discoverability
- Add license and author information
- Use appropriate file includes in package.json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the guidelines
4. Add changesets for any version-impacting changes
5. Submit a pull request

## 📄 License

All packages in this monorepo are licensed under the MIT License.

## 🔗 Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [DAWLabs NPM Organization](https://www.npmjs.com/org/dawlabs)

---

**Built with ❤️ by [Arif Widiyanto](https://github.com/sikancil)**
