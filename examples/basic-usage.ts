import { EnvironmentConfig } from '../src';

// Basic usage with default schema
const env = EnvironmentConfig.getInstance();

// Get values
const _stage = env.get('STAGE'); // 'dev' | 'prod' | 'test'
const _logLevel = env.get('LOG_LEVEL'); // 'debug' | 'info' | 'warn' | 'error'

// Get required values (throws if missing)
const _serviceName = env.getRequired('SERVICE_NAME', 'MyService');

// Convenience getters
console.log(`Running in ${env.stage} mode`);
console.log(`Is production: ${env.isProduction}`);
console.log(`Is development: ${env.isDevelopment}`);

// Get all config
const allConfig = env.getAll();
console.log('All environment variables:', allConfig);
