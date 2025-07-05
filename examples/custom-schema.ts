import { z } from 'zod';
import { BaseEnvironmentSchema, createEnvironmentConfig, mergeSchemas } from '../src';

// Define custom schema
const DatabaseSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  DATABASE_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('5000'),
});

// Merge with base schema
const FullSchema = mergeSchemas(BaseEnvironmentSchema, DatabaseSchema);

// Create environment config with custom schema
const env = createEnvironmentConfig(FullSchema);

// Now you have type safety for database variables
const dbUrl = env.getRequired('DATABASE_URL', 'Database connection');
const poolSize = env.get('DATABASE_POOL_SIZE'); // number
const timeout = env.get('DATABASE_TIMEOUT'); // number

console.log(`Database URL: ${dbUrl}`);
console.log(`Pool size: ${poolSize}`);
console.log(`Timeout: ${timeout}ms`);
