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

### ES Modules

```javascript
import { create{{className}}Lib } from '@dawlabs/{{name}}';

const lib = create{{className}}Lib({ option: 'value' });
const result = lib.execute('input data');
```

### CommonJS

```javascript
const { create{{className}}Lib } = require('@dawlabs/{{name}}');

const lib = create{{className}}Lib({ option: 'value' });
const result = lib.execute('input data');
```

### Browser (IIFE)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{name}} Example</title>
  </head>
  <body>
    <script src="https://unpkg.com/@dawlabs/{{name}}/dist/index.iife.js"></script>
    <script>
      const lib = {{className}}.create{{className}}Lib({ option: 'value' });
      const result = lib.execute('input data');
      console.log(result);
    </script>
  </body>
</html>
```

## API Reference

### `{{className}}Lib`

Main library class.

#### `constructor(config = {})`

Creates a new instance with optional configuration.

- `config`: Initial configuration object.

#### `execute(input)`

Executes the main library functionality.

- `input`: Input data to process.
- `returns`: Processed data.

#### `getConfig()`

Returns a copy of the current configuration.

#### `updateConfig(newConfig)`

Updates the configuration by merging with existing config.

- `newConfig`: New configuration object to merge.

#### `resetConfig()`

Resets the configuration to an empty object.

### `create{{className}}Lib(config)`

Factory function to create a new `{{className}}Lib` instance.

- `config`: Optional initial configuration.
- `returns`: New `{{className}}Lib` instance.

## Configuration

The library accepts a configuration object that can be used to customize
behavior:

```javascript
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
```

## Browser Support

This library supports all modern browsers and is tested against:

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## License

MIT
