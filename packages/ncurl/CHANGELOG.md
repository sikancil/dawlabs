# @dawlabs/ncurl

## 0.1.0

### Minor Changes

- feat: add api-info command and improve package structure
  - Add new `api-info` command that displays comprehensive API interaction
    guidance for LLMs
  - Improve User-Agent header with dynamic version string (0.0.1)
  - Add detailed usage examples and common patterns for LLM consumption
  - Enhance CLI documentation with smart feature explanations
  - Fix hardcoded version references in user agent string

  This update improves the developer experience for LLM users by providing:
  - Comprehensive API usage examples
  - Smart method detection patterns
  - Clear explanations of automatic features
  - Better error handling guidance

## 0.0.5

### Patch Changes

- Test improved GitHub Actions workflow with proper error handling and GitHub
  releases.

  Fixes:
  - Added --no-git-checks to pnpm publish command
  - Added createGithubReleases: true
  - Added proper error handling steps
  - Enhanced workflow status verification

## 0.0.4

### Patch Changes

- Confirm OIDC trusted publishing is working properly. v0.0.2 was successfully
  published via GitHub Actions workflow.

## 0.0.3

### Patch Changes

- Test automated OIDC publishing workflow after confirming v0.0.2 was
  successfully published via GitHub Actions.

## 0.0.3

### Patch Changes

- Test automated OIDC publishing workflow after trusted publishing setup.

## 0.0.2

### Patch Changes

- Test automated release workflow for ncurl package improvements. This is a test
  changeset to verify our GitHub Actions workflow is working properly after the
  manual first publish.
