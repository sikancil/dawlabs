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
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api
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
2. **Configuration File**: `src/app.config.js`
3. **Runtime Configuration**: Passed during application initialization

### Example Configuration

```javascript
// src/app.config.js
export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  cors: {
    origin: true,
    credentials: true,
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

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format
```

## Project Structure

```
src/
├── app.controller.js     # Application controller
├── app.service.js        # Application service
├── app.module.js         # Root module
├── app.config.js         # Configuration file
├── main.js               # Application entry point
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

## Middleware

The application includes:

- **CORS**: Cross-Origin Resource Sharing enabled
- **JSON Parser**: Request body parsing
- **Validation**: Input validation and sanitization
- **Logging**: Request/response logging

## Environment Support

- **Node.js**: 18.0.0+
- **npm/pnpm**: Latest stable version
- **Operating Systems**: Windows, macOS, Linux

## License

MIT
