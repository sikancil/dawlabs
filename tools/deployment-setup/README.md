# DAWLabs Deployment Setup

A semi-automated deployment setup and verification system for DAWLabs packages.
This tool guides you through configuring NPM trusted publishing, GitHub Actions
workflows, and repository settings with systematic validation and error
detection.

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

The deployment-setup tool is included in the DAWLabs monorepo. No additional
installation required.

## Usage

### Quick Start

```bash
# Show deployment status
pnpm deployment-setup status

# Diagnose everything
pnpm deployment-setup diagnose all

# Setup NPM trusted publishing interactively
pnpm deployment-setup setup npm-publishing --interactive

# Verify CI/CD workflow configuration
pnpm deployment-setup verify cicd-workflow
```

### Commands

#### `setup` - Configure deployment components

```bash
# Setup NPM trusted publishing
pnpm deployment-setup setup npm-publishing

# Setup repository configuration
pnpm deployment-setup setup repository

# Setup everything interactively
pnpm deployment-setup setup all --interactive

# Setup with automatic verification
pnpm deployment-setup setup npm-publishing --auto-verify
```

#### `verify` - Validate configurations

```bash
# Verify NPM publishing setup
pnpm deployment-setup verify npm-publishing

# Verify CI/CD workflow
pnpm deployment-setup verify cicd-workflow

# Verify all configurations
pnpm deployment-setup verify all
```

#### `diagnose` - Troubleshoot issues

```bash
# Diagnose repository setup
pnpm deployment-setup diagnose repository

# Diagnose publishing issues
pnpm deployment-setup diagnose publishing

# Diagnose all components with fix suggestions
pnpm deployment-setup diagnose all --fix
```

#### `status` - Show current deployment status

```bash
# Show human-readable status
pnpm deployment-setup status

# Show JSON output for scripts
pnpm deployment-setup status --json
```

## Examples

### Initial Repository Setup

```bash
# Complete initial setup
pnpm deployment-setup setup all --interactive

# Verify everything is configured
pnpm deployment-setup verify all

# Check current status
pnpm deployment-setup status
```

### Publishing New Package

```bash
# Setup NPM trusted publishing for new packages
pnpm deployment-setup setup npm-publishing --interactive

# Diagnose publishing issues
pnpm deployment-setup diagnose publishing

# Test workflow
gh workflow run release.yml
```

### Troubleshooting

```bash
# Full diagnosis with fix suggestions
pnpm deployment-setup diagnose all --fix

# Specific component diagnosis
pnpm deployment-setup diagnose workflow

# Verify fixes
pnpm deployment-setup verify all
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

The deployment-setup tool integrates seamlessly with existing DAWLabs workflows:

- **Uses existing GitHub Actions workflow**: `.github/workflows/release.yml`
- **Leverages pnpm workspaces**: Scans packages automatically
- **Compatible with Changesets**: Works with existing version management
- **Follows NestJS model**: Uses proven OIDC authentication pattern

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
   pnpm deployment-setup setup repository --interactive
   ```

4. **Package not publishing**
   ```bash
   pnpm deployment-setup diagnose publishing --fix
   ```

### Getting Help

```bash
# Show help
pnpm deployment-setup --help

# Command-specific help
pnpm deployment-setup setup --help

# Verbose output for debugging
pnpm deployment-setup diagnose all --verbose
```

## Contributing

The deployment-setup tool follows DAWLabs development standards:

- Uses ES modules and modern Node.js patterns
- Follows existing code style and structure
- Integrates with Turborepo build system
- Uses Commander.js for CLI architecture
