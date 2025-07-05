# envolution

[![npm version](https://badge.fury.io/js/envolution.svg)](https://badge.fury.io/js/envolution)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A TypeScript-first environment configuration package with Zod validation, type safety, extensible schemas, .env file support, hot reloading, and startup validation. Perfect for Node.js, AWS Lambda, and modern TypeScript applications.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Basic Usage](#basic-usage)
  - [.env File Support](#env-file-support)
  - [Hot Reloading](#hot-reloading)
  - [Template Generation](#template-generation)
  - [Startup Validation](#startup-validation)
  - [Custom Schema](#custom-schema)
  - [AWS Lambda Usage](#aws-lambda-usage)
- [Available Schemas](#available-schemas)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔒 **Type Safety**: Full TypeScript support with inferred types
- ✅ **Validation**: Runtime validation with helpful error messages using Zod
- 📝 **.env File Support**: Loads environment variables from .env files automatically
- 🔄 **Hot Reloading**: Watch for file changes and reload configuration automatically
- 🚦 **Startup Validation**: Validate all required config at startup
- 🔧 **Extensibility**: Easy to extend with custom schemas
- 📋 **Template Generation**: Generate .env templates and TypeScript types from schemas
- 🚀 **Singleton Pattern**: Thread-safe singleton instance
- ☁️ **AWS Optimized**: Built-in AWS-specific schemas
- 📦 **Zero Dependencies**: Only depends on Zod (peer dependency)
- 🌳 **Tree Shakeable**: Modular exports for optimal bundle size
- 🧪 **Well Tested**: Comprehensive test coverage

## Installation

```bash
npm install envolution
```

**✨ Zero-config setup!** `envolution` includes all its dependencies (`zod` and `dotenv`) - no need to install anything else.

## Why envolution?

| Feature | envolution | dotenv | config | convict |
|---------|------------|--------|--------|---------|
| TypeScript Support | ✅ Full type safety | ❌ No types | ❌ Basic types | ❌ No types |
| Runtime Validation | ✅ Zod schemas | ❌ No validation | ❌ No validation | ✅ Basic validation |
| Hot Reloading | ✅ Built-in | ❌ No | ❌ No | ❌ No |
| Template Generation | ✅ Auto-generate .env templates | ❌ Manual | ❌ Manual | ❌ Manual |
| AWS Optimized | ✅ Built-in schemas | ❌ No | ❌ No | ❌ No |
| Startup Validation | ✅ Built-in | ❌ No | ❌ No | ❌ No |
| Bundle Size | ✅ Tree-shakeable | ✅ Small | ❌ Large | ❌ Large |
| Zero Dependencies | ✅ Standalone package | ✅ Yes | ❌ Many deps | ❌ Many deps |

## Quick Start

### Basic Usage

```typescript
import { EnvironmentConfig, BaseEnvironmentSchema } from 'envolution';

// Get environment config with base schema (loads .env by default)
const env = EnvironmentConfig.getInstance(BaseEnvironmentSchema);

// Get values
const stage = env.get('STAGE'); // 'dev' | 'prod' | 'test'
const logLevel = env.get('LOG_LEVEL'); // 'debug' | 'info' | 'warn' | 'error'

// Get required values (throws if missing)
const serviceName = env.getRequired('SERVICE_NAME', 'MyService');

// Convenience getters
console.log(`Running in ${env.stage} mode`);
console.log(`Is production: ${env.isProduction}`);
console.log(`Is development: ${env.isDevelopment}`);
```

### .env File Support

By default, `.env` and `.env.local` files are loaded automatically. You can customize which files to load:

```typescript
const env = EnvironmentConfig.getInstance(BaseEnvironmentSchema, {
  envFiles: ['.env', '.env.production'], // custom list
  loadEnvFiles: true // (default)
});
```

### Hot Reloading

Enable hot-reloading to automatically reload configuration when files change:

```typescript
const env = EnvironmentConfig.getInstance(MySchema, {
  hotReload: true,
  watchFiles: true,
  watchInterval: 5000, // Check every 5 seconds
});

// Listen for configuration changes
env.on('configChanged', (change) => {
  console.log(`Variable ${change.variable} changed from ${change.oldValue} to ${change.newValue}`);
});

// Listen for specific variable changes
env.on('configChanged:PORT', (change) => {
  console.log(`Port changed to ${change.newValue}`);
});

// Manual reload
env.reload();

// Stop watching (cleanup)
env.stopWatching();
```

### Template Generation

Generate .env templates and TypeScript types from your schemas:

```typescript
import { generateEnvTemplate, generateTypes, generateAllTemplates } from 'envolution';

// Generate .env template
const envTemplate = generateEnvTemplate(MySchema, {
  includeDefaults: true,
  includeComments: true,
  outputFile: '.env.template'
});

// Generate TypeScript types
const typesTemplate = generateTypes(MySchema, {
  outputFile: 'env.types.ts'
});

// Generate all templates at once
const allTemplates = generateAllTemplates(MySchema, {
  envFile: '.env.template',
  typesFile: 'env.types.ts'
});
```

### Startup Validation

You can validate all required config at startup (throws if any required variable is missing or invalid):

```typescript
const env = EnvironmentConfig.getInstance(BaseEnvironmentSchema, {
  validateStartup: true
});
// If any required variable is missing/invalid, an error is thrown immediately
```

Or call manually:

```typescript
env.validateStartup();
```

### Custom Schema

```typescript
import { z } from 'zod';
import { createEnvironmentConfig, BaseEnvironmentSchema, mergeSchemas } from 'envolution';

// Define custom schema
const DatabaseSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  DATABASE_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('5000'),
});

// Merge with base schema
const FullSchema = mergeSchemas(BaseEnvironmentSchema, DatabaseSchema);

// Create environment config with custom schema (no type casting needed!)
const env = createEnvironmentConfig(FullSchema);

// Now you have type safety for database variables
const dbUrl = env.getRequired('DATABASE_URL', 'Database connection');
const poolSize = env.get('DATABASE_POOL_SIZE'); // number
const timeout = env.get('DATABASE_TIMEOUT'); // number
```

### AWS Lambda Usage

```typescript
import { EnvironmentConfig, mergeSchemas, BaseEnvironmentSchema, AWSEnvironmentSchema } from 'envolution';

// Create schema for AWS Lambda
const LambdaSchema = mergeSchemas(BaseEnvironmentSchema, AWSEnvironmentSchema);

// Get environment config
const env = EnvironmentConfig.getInstance(LambdaSchema);

// Lambda handler
export const handler = async (event: Record<string, unknown>) => {
  // Get AWS-specific environment variables
  const stage = env.stage;
  const region = env.get('AWS_REGION');
  const stateMachineArn = env.getRequired('STATE_MACHINE_ARN', 'Step Function');
  const jobTableName = env.getRequired('JOB_TABLE_NAME', 'Job table');
  
  // Your Lambda logic here...
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
```

## Available Schemas

### Base Schema

Includes common configuration options:

- `STAGE`: Environment stage ('dev', 'prod', 'test')
- `NODE_ENV`: Node environment
- `LOG_LEVEL`: Logging level
- `SERVICE_NAME`: Service name
- `VERSION`: Application version
- `ENABLE_DEBUG`: Debug mode flag
- `ENABLE_METRICS`: Metrics collection flag
- `REQUEST_TIMEOUT`: Request timeout
- `MAX_RETRIES`: Maximum retry attempts

### AWS Schema

Includes AWS-specific variables:

- `AWS_REGION`: AWS region
- `AWS_ACCOUNT_ID`: AWS account ID
- `STATE_MACHINE_ARN`: Step Function ARN
- `QUOTA_TABLE`: DynamoDB quota table
- `JOB_TABLE_NAME`: DynamoDB job table
- `QUEUE_URL`: SQS queue URL
- `MODEL_ID`: Bedrock model ID
- `LAMBDA_TIMEOUT`: Lambda timeout
- `LAMBDA_MEMORY_SIZE`: Lambda memory size

### Security Schema

Includes security-related variables:

- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `API_KEY`: API key
- `ENCRYPTION_KEY`: Encryption key
- `CORS_ORIGIN`: CORS origin
- `RATE_LIMIT_WINDOW`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting max requests

## API Reference

### EnvironmentConfig

#### `getInstance<T>(schema?, options?)`

Get singleton instance of EnvironmentConfig. Options:

- `envFiles`: string[] — Which .env files to load (default: ['.env', '.env.local'])
- `loadEnvFiles`: boolean — Whether to load .env files (default: true)
- `validateStartup`: boolean — Whether to validate all config at startup (default: false)
- `hotReload`: boolean — Whether to enable hot-reloading (default: false)
- `watchFiles`: boolean — Whether to watch for file changes (default: false)
- `watchInterval`: number — Interval in milliseconds to check for changes (default: 5000)

```typescript
const env = EnvironmentConfig.getInstance(MySchema, { validateStartup: true });
```

#### `get<K>(key)`

Get a configuration value.

```typescript
const value = env.get('MY_VARIABLE');
```

#### `getRequired<K>(key, context?)`

Get a required configuration value (throws if undefined/null).

```typescript
const value = env.getRequired('MY_VARIABLE', 'MyService');
```

#### `getAll()`

Get all configuration values.

```typescript
const allConfig = env.getAll();
```

#### `validateStartup()`

Validate all required config at startup (throws if any required variable is missing or invalid).

```typescript
env.validateStartup();
```

#### `reload()`

Manually trigger configuration reload.

```typescript
env.reload();
```

#### `stopWatching()`

Stop watching for file changes and cleanup resources.

```typescript
env.stopWatching();
```

#### Event Listeners

Listen for configuration changes:

```typescript
// General configuration change
env.on('configChanged', (change) => {
  console.log(`${change.variable} changed to ${change.newValue}`);
});

// Specific variable change
env.on('configChanged:PORT', (change) => {
  console.log(`Port changed to ${change.newValue}`);
});

// Configuration reloaded
env.on('configReloaded', (event) => {
  console.log('Configuration reloaded successfully');
});

// Reload error
env.on('configReloadError', (error) => {
  console.error('Failed to reload configuration:', error);
});
```

#### `stage`, `isProduction`, `isDevelopment`, `isTest`

Convenience getters for environment stage.

```typescript
const stage = env.stage; // 'dev' | 'prod' | 'test'
const isProd = env.isProduction; // boolean
const isDev = env.isDevelopment; // boolean
const isTest = env.isTest; // boolean
```

### Schema Utilities

#### `mergeSchemas(schema1, schema2)`

Merge two schemas together.

```typescript
const FullSchema = mergeSchemas(BaseSchema, CustomSchema);
```

#### `mergeMultipleSchemas(...schemas)`

Merge multiple schemas together.

```typescript
const FullSchema = mergeMultipleSchemas(Schema1, Schema2, Schema3);
```

#### `createCustomSchema(schema)`

Create a custom schema with proper typing.

```typescript
const CustomSchema = createCustomSchema(z.object({...}));
```

#### `createLooseSchema(schema)`

Create a schema that allows unknown properties.

```typescript
const LooseSchema = createLooseSchema(MySchema);
```

#### `createStrictSchema(schema)`

Create a schema with strict validation.

```typescript
const StrictSchema = createStrictSchema(MySchema);
```

### Template Generation

#### `generateEnvTemplate(schema, options?)`

Generate .env template from schema.

```typescript
const template = generateEnvTemplate(MySchema, {
  includeDefaults: true,
  includeComments: true,
  outputFile: '.env.template'
});
```

#### `generateTypes(schema, options?)`

Generate TypeScript types from schema.

```typescript
const types = generateTypes(MySchema, {
  outputFile: 'env.types.ts'
});
```

#### `generateAllTemplates(schema, options?)`

Generate all templates at once.

```typescript
const allTemplates = generateAllTemplates(MySchema, {
  envFile: '.env.template',
  typesFile: 'env.types.ts'
});
```

## Environment Variables

Set these environment variables in your application (or in a `.env` file):

```bash
# Base configuration
STAGE=dev
LOG_LEVEL=info
SERVICE_NAME=my-service
ENABLE_DEBUG=false
ENABLE_METRICS=true

# AWS configuration
AWS_REGION=us-east-1
STATE_MACHINE_ARN=arn:aws:states:...
JOB_TABLE_NAME=my-jobs-table
QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...

# Security configuration
JWT_SECRET=your-super-secret-jwt-key-here
API_KEY=your-api-key
```

## Error Handling

When validation fails, you get detailed error messages:

```typescript
try {
  const env = EnvironmentConfig.getInstance(MySchema, { validateStartup: true });
} catch (error) {
  if (error instanceof EnvironmentConfig.EnvironmentValidationError) {
    console.error(error.message);
    // Example:
    // Environment validation failed at startup.
    // Missing required variables: DATABASE_URL, API_KEY
    // Invalid variables: PORT (expected valid value, got 'abc')
    console.error('Missing:', error.missingVars);
    console.error('Invalid:', error.invalidVars);
  } else {
    throw error;
  }
}
```

## Testing

For testing, you can reset the singleton instance:

```typescript
import { EnvironmentConfig } from 'envolution';

beforeEach(() => {
  EnvironmentConfig.reset();
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
