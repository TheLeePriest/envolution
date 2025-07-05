import { EnvironmentConfig } from '../src';

// Example 1: Basic usage with default schema
console.log('=== Basic Usage ===');
const env = EnvironmentConfig.getInstance();

console.log(`Stage: ${env.stage}`);
console.log(`Is Production: ${env.isProduction}`);
console.log(`Is Development: ${env.isDevelopment}`);
console.log(`Log Level: ${env.get('LOG_LEVEL')}`);

// Example 2: Getting required values
console.log('\n=== Required Values ===');
try {
  const serviceName = env.getRequired('SERVICE_NAME', 'Service name');
  console.log(`Service: ${serviceName}`);
} catch (error) {
  console.log('Expected error for missing SERVICE_NAME:', (error as Error).message);
}

// Example 3: Environment-specific behavior
console.log('\n=== Environment-Specific Logic ===');
if (env.isProduction) {
  console.log('🔒 Production mode - strict security enabled');
} else if (env.isDevelopment) {
  console.log('🔧 Development mode - debug features enabled');
} else {
  console.log('🧪 Test mode - using test data');
}

// Example 4: Getting all configuration
console.log('\n=== All Configuration ===');
const allConfig = env.getAll();
console.log('Available environment variables:', Object.keys(allConfig));

// Example 5: Startup validation
console.log('\n=== Startup Validation ===');
try {
  env.validateStartup();
  console.log('✅ All environment variables are valid');
} catch (error) {
  console.log('❌ Environment validation failed:', (error as Error).message);
}

// Example 6: Convenience getters
console.log('\n=== Convenience Getters ===');
console.log(`Current stage: ${env.stage}`);
console.log(`Debug enabled: ${env.get('ENABLE_DEBUG')}`);
console.log(`Metrics enabled: ${env.get('ENABLE_METRICS')}`);
console.log(`Request timeout: ${env.get('REQUEST_TIMEOUT')}ms`);
console.log(`Max retries: ${env.get('MAX_RETRIES')}`);

// Example 7: Error handling patterns
console.log('\n=== Error Handling ===');
const getConfigSafely = (key: string, description: string) => {
  try {
    return env.getRequired(key, description);
  } catch (_error) {
    console.warn(`Warning: ${description} not configured`);
    return null;
  }
};

const databaseUrl = getConfigSafely('DATABASE_URL', 'Database connection');
const apiKey = getConfigSafely('API_KEY', 'API authentication');

console.log('Database URL:', databaseUrl);
console.log('API Key:', apiKey);

// Example 8: Environment-specific configuration object
console.log('\n=== Environment Config Object ===');
const environmentConfig = {
  development: {
    logLevel: 'debug',
    enableDebug: true,
    mockExternalApis: true,
    cacheEnabled: false,
  },
  production: {
    logLevel: 'info',
    enableDebug: false,
    mockExternalApis: false,
    cacheEnabled: true,
  },
  test: {
    logLevel: 'warn',
    enableDebug: false,
    mockExternalApis: true,
    cacheEnabled: false,
  },
};

const currentEnvConfig = environmentConfig[env.stage as keyof typeof environmentConfig];
console.log(`Configuration for ${env.stage}:`, currentEnvConfig);

console.log('\n=== Examples Complete ===');
