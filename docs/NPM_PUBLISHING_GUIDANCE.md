# DAWLabs NPM Publishing Developer Guidance

## 📋 Overview

This comprehensive guide walks developers through the complete process of
setting up and publishing packages from the DAWLabs monorepo to the NPM registry
using modern best practices with GitHub Actions OIDC authentication and our
AI-powered deployment intelligence system.

## 🎯 What This Guide Covers

1. **Prerequisites & Setup** - Initial developer environment setup
2. **Package Development** - Creating and configuring new packages
3. **Local Development** - Testing and validation workflows
4. **Version Management** - Using Changesets for semantic versioning
5. **Release Process** - Automated publishing via GitHub Actions
6. **Troubleshooting** - Common issues and fallback procedures
7. **AI Intelligence Integration** - Using our deployment intelligence system

---

## 🚀 Phase 1: Prerequisites & Initial Setup

### 1.1 Developer Account Setup

#### NPM Registry Setup

```bash
# Login to npm (required for initial setup only)
npm login

# Verify authentication
npm whoami
```

#### GitHub Setup

```bash
# Install GitHub CLI (required for our intelligence system)
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows (winget)
winget install GitHub.cli

# Authenticate with GitHub
gh auth login
```

### 1.2 Repository Configuration

#### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/arifwidianto/arifwidianto.git
cd arifwidianto

# Install dependencies (uses pnpm workspace)
pnpm install

# Verify build system
pnpm build
```

### 1.3 Environment Verification

#### Run Our Intelligence System

```bash
# Verify complete setup using our AI-powered deployment intelligence
pnpm deployment-setup setup all --interactive

# Verify all configurations
pnpm deployment-setup verify all

# Check deployment status
pnpm deployment-setup status
```

---

## 📦 Phase 2: Package Development

### 2.1 Create New Package

#### Option A: Use Our Package Generator

```bash
# Create new package interactively
pnpm create-package

# Example: Create CLI tool
pnpm create-package cli

# Example: Create TypeScript library
pnpm create-package typescript-lib

# Example: Create shared utility
pnpm create-package shared-util
```

#### Option B: Manual Setup

```bash
# Navigate to packages directory
cd packages

# Create package directory
mkdir your-package-name
cd your-package-name

# Initialize package
npm init -y

# Add workspace configuration to package.json
{
  "name": "@dawlabs/your-package-name",
  "version": "0.0.1",
  "publishConfig": {
    "access": "public"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

### 2.2 Package Configuration

#### Essential Files Structure

```
packages/your-package/
├── package.json
├── README.md
├── tsconfig.json
├── .eslintrc.js
├── tsup.config.ts  # Build configuration
├── src/
│   ├── index.ts
│   └── cli.ts      # If CLI tool
└── dist/            # Generated build output
```

#### TypeScript Configuration (`tsconfig.json`)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

#### Build Configuration (`tsup.config.ts`)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

### 2.3 Development Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔧 Phase 3: Local Development & Testing

### 3.1 Development Workflow

#### Day-to-Day Development

```bash
# Start development with watch mode
pnpm dev

# Run linting (with our intelligence system)
pnpm lint

# Run tests
pnpm test

# Type checking
pnpm check-types

# Build for production
pnpm build
```

#### Use Our AI Intelligence System

```bash
# Analyze package readiness for publishing
node tools/deployment-setup/api/intelligence-server.js &

# Test with our multi-oracle analysis
pnpm deployment-setup diagnose publishing --fix

# Verify package configuration
pnpm deployment-setup verify package-config
```

### 3.2 Pre-Commit Quality Gates

#### Our intelligence system automatically runs:

- **ESLint/Prettier** formatting and linting
- **TypeScript** type checking
- **Build validation**
- **NPM registry conflict detection**
- **Dependency analysis**
- **Version compatibility checking**

#### Manual verification before committing:

```bash
# Run full verification
pnpm deployment-setup verify all

# Check specific package
pnpm deployment-setup verify package-config --package your-package-name
```

---

## 📝 Phase 4: Version Management with Changesets

### 4.1 Adding Changesets

#### After completing meaningful changes:

```bash
# Create interactive changeset
pnpm changeset

# Add changeset for bug fix
pnpm changeset patch

# Add changeset for new feature
pnpm changeset minor

# Add changeset for breaking change
pnpm changeset major
```

#### Changeset Format

```markdown
---
'@dawlabs/your-package': minor
'@dawlabs/dependent-package': patch
---

Added new feature and fixed dependency version issues

- Feature: Describe what changed
- Fix: Bug fix details
- Breaking: Breaking change details if any
```

### 4.2 Version Management Strategy

#### Choose Your Approach:

**1. Independent Publishing (Recommended)**

- Each package versions independently based on changesets
- More granular releases
- Better for large monorepos

**2. Fixed Version Publishing**

- Configure related packages to version together
- Use `.changeset/config.json`:

```json
{
  "fixed": [["@dawlabs/ui", "@dawlabs/utils"]],
  "linked": []
}
```

### 4.3 Version Bumping

#### Local version bumping (for testing):

```bash
# Apply all changesets and bump versions locally
pnpm changeset version

# Review version changes
git status
git add .
git commit -m "chore: version packages"
```

---

## 🚀 Phase 5: Release Process

### 5.1 Automated Release via GitHub Actions

#### The release process is triggered by:

**1. Pushing to main branch**

```bash
# After adding changesets and committing changes
git add .
git commit -m "feat: add new feature"
git push origin main
```

**2. Manual workflow dispatch**

```bash
# Or trigger manually via GitHub Actions UI
# Visit: https://github.com/arifwidianto/arifwidianto/actions
```

### 5.2 What Happens During Release

#### Our Intelligent Release Process:

1. **Code Quality Checks** - ESLint, TypeScript, Prettier
2. **Build Validation** - All packages build successfully
3. **AI Intelligence Analysis** - Multi-oracle deployment analysis
4. **NPM Registry Check** - Real-time conflict detection
5. **Version Management** - Changeset versioning and changelog
6. **OIDC Authentication** - Secure token-based publishing
7. **Automated Publishing** - NPM package publishing
8. **Release Verification** - Post-publish validation

#### Release Workflow:

```yaml
# .github/workflows/release.yml (Current configuration)

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write # For creating releases
      id-token: write # For npm OIDC authentication
      pull-requests: write # For changeset PR creation
```

### 5.3 Monitoring Release Process

#### Check GitHub Actions:

1. Visit [GitHub Actions](https://github.com/arifwidianto/arifwidianto/actions)
2. Look for "Release" workflow runs
3. Review logs for any issues

#### Verify Published Packages:

```bash
# Check if package was published successfully
npm view @dawlabs/ncurl

# Verify version and metadata
npm info @dawlabs/ncurl
```

---

## 🔍 Phase 6: Troubleshooting & Fallback Procedures

### 6.1 Common Issues & Solutions

#### Issue 1: OIDC Authentication Failure

**Symptoms:**

```
Error: Unable to authenticate, need: Basic authentication
```

**Solutions:**

```bash
# Verify repository is connected to npm organization
# Visit: https://www.npmjs.com/org/your-org/packages

# Fallback: Use traditional npm token
# 1. Generate npm token: https://www.npmjs.com/settings/tokens
# 2. Add to GitHub secrets: NPM_TOKEN
# 3. Update workflow to use token:
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Issue 2: Permission Denied

**Symptoms:**

```
Error: 403 Forbidden - You don't have permission
```

**Solutions:**

```bash
# Verify npm organization membership
npm team ls your-org:developers

# Request access from organization owner
# Ensure repository is connected to correct npm organization
```

#### Issue 3: Build Failures

**Symptoms:**

```
Build failed with TypeScript errors
```

**Solutions:**

```bash
# Local debugging
pnpm build

# Check TypeScript configuration
pnpm check-types

# Fix linting issues
pnpm lint:fix
```

### 6.2 Fallback Publishing Procedures

#### Option 1: Manual Publishing

```bash
# Build packages locally
pnpm build

# Publish specific package
cd packages/your-package
npm publish --access public

# For packages requiring OTP
npm publish --access public --otp=YOUR_OTP_CODE
```

#### Option 2: Local Release Script

```bash
# Use changeset locally for versioning
pnpm changeset version

# Build and publish manually
pnpm build
pnpm release
```

### 6.3 Getting Help

#### Use Our Intelligence System:

```bash
# Diagnose issues automatically
pnpm deployment-setup diagnose all --fix

# Check configuration status
pnpm deployment-setup status --json

# Get detailed diagnostics
pnpm deployment-setup diagnose publishing --verbose
```

#### Manual Verification Commands:

```bash
# Check npm authentication
npm whoami

# Verify package access
npm access ls-collaborators @dawlabs/your-package

# Test publishing permissions
npm pack --dry-run
```

---

## 🤖 Phase 7: AI Intelligence Integration

### 7.1 Our Multi-Oracle Intelligence System

Our deployment-setup includes an AI-powered intelligence system with 6
independent oracles:

1. **Real NPM Registry Oracle** - Prevents false positive version conflicts
2. **Git History Oracle** - Analyzes publishing patterns
3. **Build Artifact Oracle** - Validates build state
4. **Local State Oracle** - Checks package configuration
5. **Network Cache Oracle** - Optimizes analysis speed
6. **Semantic Version Oracle** - Ensures version compliance

### 7.2 Using the Intelligence System

#### Pre-Publishing Analysis:

```bash
# Run comprehensive analysis before publishing
pnpm deployment-setup diagnose publishing

# Get detailed analysis report
pnpm deployment-setup diagnose publishing --verbose

# Use AI to fix detected issues
pnpm deployment-setup diagnose publishing --fix
```

#### Real-time Monitoring:

```bash
# Start intelligence server for continuous monitoring
node tools/deployment-setup/api/intelligence-server.js

# Check status via API
curl http://localhost:3000/api/status
```

### 7.3 Intelligence Features

#### Conflict Prevention:

- **Real NPM Registry checking** prevents false positives
- **Version conflict detection** before publishing
- **Dependency analysis** for compatibility issues

#### Predictive Analytics:

- **Success probability** scoring for each release
- **Risk assessment** with mitigation strategies
- **Historical pattern** analysis for optimization

#### Automated Workflows:

- **Safe publishing pipelines** with approval gates
- **Rollback strategies** for failed releases
- **Continuous learning** from publishing outcomes

---

## 📊 Quick Reference Checklist

### Pre-Development Checklist

- [ ] Developer account created on npmjs.com
- [ ] GitHub CLI installed and authenticated
- [ ] Repository cloned and dependencies installed
- [ ] Development environment verified with `pnpm deployment-setup verify all`

### Package Development Checklist

- [ ] Package created with proper structure
- [ ] `package.json` configured with publishConfig
- [ ] TypeScript and build configuration set up
- [ ] Tests written and passing
- [ ] Code linting and formatting compliant

### Pre-Release Checklist

- [ ] All changes documented with changesets
- [ ] Code quality checks passing (`pnpm lint`, `pnpm test`, `pnpm build`)
- [ ] AI intelligence system validation
      (`pnpm deployment-setup diagnose publishing`)
- [ ] Dependencies and version compatibility verified
- [ ] Documentation updated (README.md)

### Post-Release Verification

- [ ] GitHub Actions completed successfully
- [ ] Package published and accessible on npm
- [ ] Version bumped correctly
- [ ] Changelog generated and accurate
- [ ] Install command works: `npm install @dawlabs/your-package`

---

## 🆘 Emergency Procedures

### If All Else Fails: Manual Recovery

#### 1. Bypass Automated Systems

```bash
# Direct npm publishing
cd packages/your-package
npm publish --access public --force
```

#### 2. Reset Changesets

```bash
# Reset changeset state if corrupted
rm -rf .changeset/.changeset-temp
git checkout HEAD -- .changeset/
pnpm changeset version
```

#### 3. Contact Support

- **GitHub Issues**: Create issue in
  [arifwidianto](https://github.com/arifwidianto/arifwidianto/issues)
- **NPM Support**: Contact through npm support channels
- **Team Communication**: Alert maintainers via established channels

---

## 📚 Additional Resources

### Official Documentation

- [npm Trusted Publishing Guide](https://docs.npmjs.com/guides/trusted-publishing)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions OIDC Setup](https://docs.github.com/en/actions/deployment/security-hardening-with-openid-connect)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)

### DAWLabs Specific Resources

- **Internal Tools**: `tools/deployment-setup/` - Our AI intelligence system
- **Package Templates**: `tools/create-dawlabs-package/templates/` - Reusable
  package templates
- **Configuration**: `.changeset/config.json` - Version management settings

### Best Practice References

- [Semantic Versioning 2.0](https://semver.org/)
- [Conventional Commits](https://conventionalcommits.org/)
- [OpenID Connect Security](https://openid.net/connect/)

---

## 🎉 Success Metrics

### Release Success Indicators:

✅ **Zero Build Errors** - All packages build successfully ✅ **No Conflicts
Detected** - AI intelligence confirms safe publishing ✅ **Successful
Publishing** - Packages appear on npm registry ✅ **Correct Versioning** -
Semantic versioning applied properly ✅ **Documentation Updated** - Changelog
and README updated

### Quality Metrics:

📊 **Test Coverage** - All packages maintain >80% test coverage 🔒 **Security
Score** - No vulnerabilities in published packages ⚡ **Performance** - Package
size and load times within limits 🔄 **Reliability** - Zero rollback incidents

---

**🚀 Ready to publish your first package?** Follow this guide from Phase 1, and
our AI intelligence system will help you avoid common pitfalls and ensure
successful releases every time!

_This guide is maintained by the DAWLabs team and updated with the latest best
practices and tooling improvements._
