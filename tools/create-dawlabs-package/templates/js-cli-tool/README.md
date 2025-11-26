# @dawlabs/{{name}}

{{description}}

## Installation

```bash
npm install @dawlabs/{{name}}
# or
pnpm add @dawlabs/{{name}}
# or
yarn add @dawlabs/{{name}}
```

## Usage

### Command Line

```bash
# Display help
{{name}} --help

# Display version
{{name}} --version

# Run the main functionality
{{name}} run

# Run with verbose output
{{name}} run --verbose

# Run with custom config
{{name}} run --config ./config.json

# Run with dry-run mode
{{name}} run --dry-run
```

### Programmatic Usage

```javascript
import { main } from '@dawlabs/{{name}}';

// Run the CLI programmatically
main(process.argv);
```

## Commands

### `run [options]`

Run the main functionality of the CLI tool.

**Options:**

- `-v, --verbose`: Enable verbose output
- `-c, --config <path>`: Specify a configuration file path
- `-d, --dry-run`: Show what would be done without executing
- `-h, --help`: Display help for the run command

**Examples:**

```bash
# Basic usage
{{name}} run

# Verbose output
{{name}} run --verbose

# Custom configuration
{{name}} run --config ./my-config.json

# Dry run to preview actions
{{name}} run --dry-run
```

## API Reference

### `main(argv)`

Main entry point for the CLI tool.

- `argv`: Array of command line arguments (typically `process.argv`)
- Returns: `Promise<void>`

### Configuration

The CLI tool can be configured using a JSON file:

```json
{
  "option": "value",
  "setting": true,
  "verbose": false
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Start development mode
pnpm dev
```

## Environment

This CLI tool supports:

- Node.js 18+
- Windows, macOS, and Linux
- ES modules and CommonJS environments

## License

MIT
