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

### Running the Application

```bash
# Start the application in development mode
pnpm start:dev

# Start the application in production mode
pnpm start:prod

# Build the application
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns the application health status.

### Root Endpoint

```bash
GET /
```

Returns a welcome message with application information.

### API Endpoint

```bash
GET /api
```

Returns API information and available endpoints.

## Configuration

The application can be configured through:

1. **Environment Variables**: Set in `.env` file or system environment
2. **Configuration File**: `src/app.config.ts`
3. **Runtime Configuration**: Passed during application initialization

### Example Configuration

```typescript
// src/app.config.ts
export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm start:dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

## Project Structure

```
src/
├── app.controller.ts     # Application controller
├── app.service.ts        # Application service
├── app.module.ts         # Root module
├── app.config.ts         # Configuration file
├── main.ts               # Application entry point
├── dto/                  # Data transfer objects
├── entities/             # Database entities
├── interfaces/           # TypeScript interfaces
└── test/                 # Test files
```

## Controllers

### {{className}}Controller

Main application controller handling core endpoints.

- `GET /` - Welcome message
- `GET /api` - API information
- `GET /health` - Health check

## Services

### {{className}}Service

Application service providing core business logic.

- `getHello()` - Returns welcome message
- `getApiInfo()` - Returns API information
- `getHealthStatus()` - Returns health status

## Data Transfer Objects

### Create{{className}}Dto

DTO for creating resources with validation:

```typescript
export class Create{{className}}Dto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Interfaces

### {{className}}Config

TypeScript interface for configuration:

```typescript
export interface {{className}}Config {
  port: number;
  env: string;
  apiPrefix: string;
  cors: {
    origin: boolean | string[];
    credentials: boolean;
  };
  database?: {
    url: string;
    ssl?: boolean;
  };
  logging: {
    level: string;
  };
}
```

## Middleware

The application includes:

- **CORS**: Cross-Origin Resource Sharing enabled
- **JSON Parser**: Request body parsing with validation
- **Validation**: Input validation and sanitization using class-validator
- **Logging**: Request/response logging with structured logs
- **Security**: Helmet for security headers, rate limiting

## Testing

The application includes comprehensive testing:

- **Unit Tests**: Testing individual components and services
- **Integration Tests**: Testing component interactions
- **E2E Tests**: Testing full application workflows

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## Environment Support

- **Node.js**: 18.0.0+
- **TypeScript**: 5.0+
- **npm/pnpm**: Latest stable version
- **Operating Systems**: Windows, macOS, Linux
- **Databases**: PostgreSQL, MySQL, SQLite (configurable)

## License

MIT
