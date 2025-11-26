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

```typescript
import { main } from '@dawlabs/{{name}}';

// Run the CLI programmatically
main(process.argv);
```

## Commands

### `run [options]`

Run the main functionality of the TypeScript CLI tool.

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

Main entry point for the TypeScript CLI tool.

- `argv`: Array of command line arguments (typically `process.argv`)
- Returns: `Promise<void>`

### Configuration

The CLI tool can be configured using a JSON file:

```json
{
  "option": "value",
  "setting": true,
  "typescript": {
    "strict": true,
    "target": "ES2020"
  }
}
```

## TypeScript Support

This package includes TypeScript type definitions:

```typescript
import { CLIConfig, RunOptions } from '@dawlabs/{{name}}';

const config: CLIConfig = {
  option: 'value',
  setting: true,
};

const options: RunOptions = {
  verbose: true,
  config: './config.json',
  dryRun: false,
};
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

# Type checking
pnpm check-types

# Start development mode
pnpm dev
```

## Environment

This TypeScript CLI tool supports:

- Node.js 18+
- TypeScript 5.0+
- Windows, macOS, and Linux
- Full TypeScript type safety and IntelliSense

## License

MIT
