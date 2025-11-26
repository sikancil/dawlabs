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

```typescript
import { create{{className}}Lib } from '@dawlabs/{{name}}';

const lib = create{{className}}Lib({ option: 'value' });
const result = await lib.execute('input data');
```

## API Reference

### `{{className}}Lib`

Main library class.

#### `constructor(config?: Record<string, unknown>)`

Creates a new instance with optional configuration.

- `config`: Initial configuration object.

#### `execute<T>(input: T): Promise<T>`

Executes the main library functionality.

- `input`: Input data to process.
- `returns`: Promise resolving to processed data.

#### `getConfig(): Record<string, unknown>`

Returns a copy of the current configuration.

#### `updateConfig(newConfig: Record<string, unknown>): void`

Updates the configuration by merging with existing config.

- `newConfig`: New configuration object to merge.

#### `resetConfig(): void`

Resets the configuration to an empty object.

### `create{{className}}Lib(config?: Record<string, unknown>): {{className}}Lib`

Factory function to create a new `{{className}}Lib` instance.

- `config`: Optional initial configuration.
- `returns`: New `{{className}}Lib` instance.

## Configuration

The library accepts a configuration object that can be used to customize
behavior:

```typescript
const lib = create{{className}}Lib({
  option1: 'value1',
  option2: true,
  option3: { nested: 'config' }
});
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type checking
pnpm check-types
```

## Type Safety

This package is written in TypeScript and provides full type safety:

```typescript
import { create{{className}}Lib } from '@dawlabs/{{name}}';

interface Config {
  debug?: boolean;
  timeout?: number;
}

const lib = create{{className}}Lib<Config>({
  debug: true,
  timeout: 5000,
});
```

## Browser Support

This library supports all modern browsers:

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## License

MIT
