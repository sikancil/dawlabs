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

### Basic Module Import

```typescript
import { Module } from '@nestjs/common';
import { create{{name}}Module } from '@dawlabs/{{name}}';

@Module({
  imports: [
    create{{name}}Module({
      global: true,
      config: {
        enableLogging: true,
        options: { custom: 'value' },
        services: {
          api: 'https://api.example.com',
        },
      },
    }),
  ],
})
export class AppModule {}
```

### Dynamic Configuration

```typescript
import { Module } from '@nestjs/common';
import { create{{name}}Module } from '@dawlabs/{{name}}';

@Module({
  imports: [
    create{{name}}Module({
      global: false, // not global, need to import in other modules
      config: {
        enableLogging: process.env.NODE_ENV !== 'production',
        options: {
          timeout: 5000,
        },
      },
      providers: [CustomService],
      exports: [CustomService],
    }),
  ],
})
export class FeatureModule {}
```

### Using in Services

```typescript
import { Injectable } from '@nestjs/common';
import { {{name}}Service } from '@dawlabs/{{name}}';

@Injectable()
export class MyService {
  constructor(private readonly {{name}}Service: {{name}}Service) {}

  async processData(data: any) {
    const result = await this.{{name}}Service.processData(data);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  }

  async checkHealth() {
    return this.{{name}}Service.healthCheck();
  }
}
```

### Using the Controller Endpoints

Once the module is imported, the following endpoints are available:

- `POST /{{name}}/process` - Process data
- `GET /{{name}}/health` - Health check
- `GET /{{name}}/config` - Get configuration (safe version)
- `GET /{{name}}/test` - Test endpoint

## API Reference

### `create{{name}}Module(config?: {{name}}ModuleConfig)`

Creates a dynamic NestJS module.

#### Parameters

- `config.global?: boolean` - Whether to make the module global
- `config.config?: Record<string, unknown>` - Configuration options
- `config.providers?: Provider[]` - Additional providers
- `config.exports?: any[]` - Additional exports

### `{{name}}Service`

Main service class for the plugin.

#### Methods

- `getConfig(): {{name}}Config` - Get current configuration
- `processData<T>(data: T): Promise<{{name}}Response<T>>` - Process data
- `healthCheck(): Promise<boolean>` - Perform health check
- `emitEvent(event: string, payload: Record<string, unknown>): Promise<void>` -
  Emit events

### `{{name}}Controller`

Provides HTTP endpoints for the service.

#### Endpoints

- `POST /{{name}}/process` - Process data via HTTP
- `GET /{{name}}/health` - Health check via HTTP
- `GET /{{name}}/config` - Get configuration via HTTP
- `GET /{{name}}/test` - Test endpoint

### Interfaces

#### `{{name}}Config`

```typescript
interface {{name}}Config {
  enableLogging?: boolean;
  options?: Record<string, unknown>;
  services?: {
    api?: string;
    auth?: string;
  };
}
```

#### `{{name}}Response<T>`

```typescript
interface {{name}}Response<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
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

## Testing

The plugin includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Dependencies

- **Peer Dependencies**: NestJS framework packages
- **Dependencies**: Only DAWLabs shared types
- **Dev Dependencies**: Full NestJS testing setup

## License

MIT
