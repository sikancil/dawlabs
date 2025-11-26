# @dawlabs/create-package

CLI tool to create DAWLabs packages from predefined templates

## Installation

```bash
npm install -g @dawlabs/create-package
# or
pnpm add -g @dawlabs/create-package
# or
yarn global add @dawlabs/create-package
```

## Usage

### Quick Start

```bash
# Create a new package
create-dawlabs-package <type> <name>

# Examples
create-dawlabs-package cli-tool my-cli
create-dawlabs-package nestjs-app my-api
create-dawlabs-package node-lib my-utils
```

### Available Package Types

The CLI tool supports 12 package templates:

#### JavaScript Templates

- `cli-tool` - CLI tool with executable output
- `node-lib` - Node.js library for server-side packages
- `browser-lib` - Browser library for frontend packages
- `js` - Pure JavaScript library
- `nestjs-app` - NestJS application
- `nestjs-plugin` - NestJS plugin/module package

#### TypeScript Templates

- `ts-cli-tool` - CLI tool with executable output
- `ts-node-lib` - Node.js library for server-side packages
- `ts-browser-lib` - Browser library for frontend packages
- `ts` - TypeScript library with full type safety
- `ts-nestjs-app` - NestJS application
- `ts-nestjs-plugin` - NestJS plugin/module package

### Command Options

```bash
Usage: create-dawlabs-package <type> <name> [options]

Package Types:
  cli-tool          CLI tool with executable output (JavaScript)
  nestjs-app        NestJS application (TypeScript)
  node-lib          Node.js library for server-side packages (JavaScript)
  browser-lib       Browser library for frontend packages (JavaScript)
  js                Pure JavaScript library
  ts                TypeScript library with full type safety
  js-nestjs-app     NestJS application (JavaScript)
  ts-cli-tool       CLI tool with executable output (TypeScript)
  ts-node-lib       Node.js library for server-side packages (TypeScript)
  ts-browser-lib    Browser library for frontend packages (TypeScript)
  nestjs-plugin     NestJS plugin/module package (TypeScript)
  js-nestjs-plugin  NestJS plugin/module package (JavaScript)

Examples:
  create-dawlabs-package cli-tool my-cli
  create-dawlabs-package nestjs-app my-api
  create-dawlabs-package node-lib my-utils
  create-dawlabs-package browser-lib my-ui-lib
  create-dawlabs-package js my-js-lib
  create-dawlabs-package ts my-ts-lib
  create-dawlabs-package nestjs-plugin my-nestjs-module

Options:
  --packages-dir <dir>  Packages directory (default: packages)
  --description <text>   Package description
  --author <email>      Author email (default: arif@dawlabs.dev)
  --help              Show this help
```

### Advanced Usage

```bash
# Create package with custom description
create-dawlabs-package cli-tool my-awesome-cli --description "An awesome CLI tool"

# Create package in custom directory
create-dawlabs-package node-lib my-lib --packages-dir ./projects

# Create package with custom author
create-dawlabs-package ts my-types-lib --author "developer@company.com"

# Show help
create-dawlabs-package --help
```

## Generated Package Structure

### CLI Tool (js-cli-tool / ts-cli-tool)

```
my-cli/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jest.config.js
├── tsup.config.ts
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   └── run.ts
│   ├── services/
│   │   └── cli.service.ts
│   └── __tests__/
│       └── cli.test.ts
├── dist/
│   ├── cli.cjs
│   └── cli.cjs.map
└── README.md
```

### Library (js-node-lib / ts-node-lib)

```
my-lib/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jest.config.js
├── tsup.config.ts
├── src/
│   ├── index.ts
│   ├── lib/
│   │   └── my-lib.service.ts
│   └── __tests__/
│       └── index.test.ts
├── dist/
│   ├── index.js
│   ├── index.cjs
│   ├── index.global.js
│   ├── index.d.ts
│   └── *.map files
└── README.md
```

### Browser Library (js-browser-lib / ts-browser-lib)

```
my-browser-lib/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jest.config.js
├── tsup.config.ts
├── src/
│   ├── index.ts
│   ├── browser/
│   │   └── my-browser-lib.ts
│   └── __tests__/
│       └── browser.test.ts
├── dist/
│   ├── index.js
│   ├── index.cjs
│   ├── index.global.js
│   ├── index.d.ts
│   └── *.map files
└── README.md
```

### NestJS Application (js-nestjs-app / ts-nestjs-app)

```
my-app/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jest.config.js
├── nest-cli.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── dto/
│   └── __tests__/
├── dist/
└── README.md
```

### NestJS Plugin (js-nestjs-plugin / ts-nestjs-plugin)

```
my-plugin/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── jest.config.js
├── tsup.config.ts
├── src/
│   ├── index.ts
│   ├── my-plugin.module.ts
│   ├── my-plugin.service.ts
│   ├── my-plugin.controller.ts
│   ├── interfaces/
│   └── __tests__/
├── dist/
└── README.md
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/sikancil/dawlabs.git
cd dawlabs/tools/create-dawlabs-package

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm check-types
```

### Template Structure

```
templates/
├── js/                   # Pure JavaScript library
├── js-cli-tool/          # JavaScript CLI tool
├── js-node-lib/          # JavaScript Node.js library
├── js-browser-lib/       # JavaScript browser library
├── js-nestjs-app/        # JavaScript NestJS application
├── js-nestjs-plugin/     # JavaScript NestJS plugin
├── ts/                   # TypeScript library
├── ts-cli-tool/          # TypeScript CLI tool
├── ts-node-lib/          # TypeScript Node.js library
├── ts-browser-lib/       # TypeScript browser library
├── ts-nestjs-app/        # TypeScript NestJS application
├── ts-nestjs-plugin/     # TypeScript NestJS plugin
└── .vscode/              # VSCode settings and snippets
```

### Template Variables

Templates use the following variables:

- `{{name}}` - Package name (kebab-case)
- `{{className}}` - Package class name (PascalCase)
- `{{description}}` - Package description
- `{{author}}` - Package author email

### Adding New Templates

1. Create a new directory in `templates/`
2. Add package.json with template variables
3. Create source files with template variables
4. Add appropriate configuration files (eslint, jest, etc.)
5. Add README.md with template variables
6. Update the main CLI to include the new template type

## Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PACKAGES_DIR` - Default packages directory (can be overridden with
  --packages-dir)

### Customization

You can customize templates by modifying files in the `templates/` directory:

- Update package.json templates for different dependencies
- Modify source code templates for different patterns
- Adjust configuration files for different build setups
- Add new template variables as needed

## Troubleshooting

### Common Issues

**Template Generation Failed**

- Check if the packages directory exists
- Verify you have write permissions
- Ensure the package name is valid

**Build Errors**

- Check Node.js version compatibility
- Verify all dependencies are installed
- Check TypeScript configuration

**Missing Dependencies**

- Run `pnpm install` in the generated package directory
- Check package.json for missing dependencies

### Getting Help

```bash
# Show available templates
create-dawlabs-package --help

# Show version
create-dawlabs-package --version

# Check if CLI is installed
create-dawlabs-package --version
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT

---

**DAWLabs Built with ❤️ by [arifWidianto](https://github.com/sikancil)**
