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

### Using as a module

```typescript
import { create{{name}}Browser } from '@dawlabs/{{name}}';

// Initialize with CSS selector
const browser = create{{name}}Browser('#my-container');
browser.init();

// Render content
browser.render('<h1>Hello World</h1>');
```

### Using directly in browser

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{name}} Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://unpkg.com/@dawlabs/{{name}}/dist/index.iife.js"></script>
    <script>
      const browser = {{name}}.create{{name}}Browser('#app');
      browser.init();
      browser.render('<h1>Hello from {{name}}!</h1>');
    </script>
  </body>
</html>
```

## API Reference

### `{{name}}Browser`

Main browser component class.

#### `constructor(selectorOrElement?: string | HTMLElement)`

Creates a new instance of the browser component.

- `selectorOrElement`: Optional CSS selector string or DOM element.

#### `init(): void`

Initializes the component and adds the `{{name}}-initialized` class to the
container.

#### `render(content: string | HTMLElement): void`

Renders content to the container.

- `content`: HTML string or DOM element to render.

#### `destroy(): void`

Cleans up the component and removes initialization classes.

#### `getContainer(): HTMLElement | null`

Returns the container element.

### `create{{name}}Browser(selectorOrElement?: string | HTMLElement)`

Factory function to create a new browser instance.

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

## Browser Support

This library supports all modern browsers:

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## License

MIT
