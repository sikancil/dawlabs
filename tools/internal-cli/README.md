# DAWLabs Internal CLI

An internal CLI tool for DAWLabs package management, verification, and
deployment workflows. This tool provides comprehensive package analysis,
deployment configuration, and Oracle Intelligence features for systematic
development workflows.

## Features

- **🚀 Interactive Setup**: Step-by-step guidance for deployment configurations
- **🔍 Comprehensive Verification**: Validates all deployment components
  automatically
- **🩺 Advanced Diagnostics**: Troubleshoots deployment issues with fix
  suggestions
- **📊 Status Monitoring**: Real-time deployment status tracking
- **🔄 GitHub CLI Integration**: Leverages existing GitHub CLI workflows
- **✅ Systematic Validation**: Ensures all configurations follow best practices

## Installation

The internal CLI tool is included in the DAWLabs monorepo. No additional
installation required.

## Usage

### Quick Start

```bash
# Show deployment status
pnpm cli status

# Diagnose everything
pnpm cli diagnose all

# Setup NPM trusted publishing interactively
pnpm cli setup npm-publishing --interactive

# Verify CI/CD workflow configuration
pnpm cli verify cicd-workflow
```

### Commands

#### `setup` - Configure deployment components

```bash
# Setup NPM trusted publishing
pnpm cli setup npm-publishing

# Setup repository configuration
pnpm cli setup repository

# Setup everything interactively
pnpm cli setup all --interactive

# Setup with automatic verification
pnpm cli setup npm-publishing --auto-verify
```

#### `verify` - Validate configurations

```bash
# Verify NPM publishing setup
pnpm cli verify npm-publishing

# Verify CI/CD workflow
pnpm cli verify cicd-workflow

# Verify all configurations
pnpm cli verify all
```

#### `diagnose` - Troubleshoot issues

```bash
# Diagnose repository setup
pnpm cli diagnose repository

# Diagnose publishing issues
pnpm cli diagnose publishing

# Diagnose all components with fix suggestions
pnpm cli diagnose all --fix
```

#### `status` - Show current deployment status

```bash
# Show human-readable status
pnpm cli status

# Show JSON output for scripts
pnpm cli status --json
```

## Examples

### Initial Repository Setup

```bash
# Complete initial setup
pnpm cli setup all --interactive

# Verify everything is configured
pnpm cli verify all

# Check current status
pnpm cli status
```

### Publishing New Package

```bash
# Setup NPM trusted publishing for new packages
pnpm cli setup npm-publishing --interactive

# Diagnose publishing issues
pnpm cli diagnose publishing

# Test workflow
gh workflow run release.yml
```

### Troubleshooting

```bash
# Full diagnosis with fix suggestions
pnpm cli diagnose all --fix

# Specific component diagnosis
pnpm cli diagnose workflow

# Verify fixes
pnpm cli verify all
```

## Configuration

The tool uses configuration from `config/deployment.json` with these settings:

- **NPM Registry**: https://registry.npmjs.org
- **GitHub Environment**: production
- **Package Scope**: @dawlabs
- **Required Permissions**: contents: write, pull-requests: write, id-token:
  write

## Prerequisites

- GitHub CLI installed and authenticated
- NPM account with 2FA enabled
- Git repository initialized
- pnpm package manager

## Command Reference

### Global Options

- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable colored output
- `-h, --help`: Show help

### Setup Types

- `npm-publishing`: Configure NPM trusted publishing
- `cicd-workflow`: Setup GitHub Actions workflow
- `repository`: Configure repository settings
- `all`: Complete setup of all components

### Verification Types

- `npm-publishing`: Validate NPM publishing configuration
- `cicd-workflow`: Verify GitHub Actions workflow
- `package-config`: Check package configurations
- `all`: Verify all configurations

### Diagnostic Scopes

- `repository`: Repository and GitHub CLI setup
- `publishing`: NPM authentication and package publishing
- `workflow`: GitHub Actions and CI/CD configuration
- `all`: Complete system diagnosis

## Integration with Existing Workflows

The internal-cli tool integrates seamlessly with existing DAWLabs workflows:

- **Uses existing GitHub Actions workflow**: `.github/workflows/release.yml`
- **Leverages pnpm workspaces**: Scans packages automatically
- **Compatible with Changesets**: Works with existing version management
- **Follows Oracle Intelligence model**: Uses proven OIDC authentication pattern

## Error Handling

The tool provides comprehensive error handling:

- **Automatic validation**: Checks configurations before proceeding
- **Clear error messages**: Specific guidance for each issue
- **Fix suggestions**: Automated recommendations for common problems
- **Graceful failures**: Continues operation when possible

## Security

- **OIDC Authentication**: No static tokens required
- **2FA Enforcement**: Requires two-factor authentication
- **Environment Protection**: Uses production environment
- **Minimal Permissions**: Requests only necessary GitHub permissions

## Troubleshooting

### Common Issues

1. **GitHub CLI not authenticated**

   ```bash
   gh auth login
   ```

2. **NPM authentication issues**

   ```bash
   npm login
   ```

3. **Workflow file not found**

   ```bash
   pnpm cli setup repository --interactive
   ```

4. **Package not publishing**
   ```bash
   pnpm cli diagnose publishing --fix
   ```

### Getting Help

```bash
# Show help
pnpm cli --help

# Command-specific help
pnpm cli setup --help

# Verbose output for debugging
pnpm cli diagnose all --verbose
```

## Contributing

The internal-cli tool follows DAWLabs development standards:

- Uses ES modules and modern Node.js patterns
- Follows existing code style and structure
- Integrates with Turborepo build system
- Uses Commander.js for CLI architecture
