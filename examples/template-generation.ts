import { z } from 'zod';
import {
  BaseEnvironmentSchema,
  generateAllTemplates,
  generateEnvTemplate,
  generateTypes,
} from '../src';

// Define a custom schema for our application
const CustomAppSchema = z.object({
  // Database configuration
  DATABASE_URL: z.string().url().describe('Database connection URL'),
  DATABASE_POOL_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default('10')
    .describe('Database connection pool size'),

  // API configuration
  API_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default('3000')
    .describe('API server port'),
  API_HOST: z.string().default('localhost').describe('API server host'),

  // Security configuration
  JWT_SECRET: z.string().min(32).describe('JWT signing secret (min 32 characters)'),
  API_KEY: z.string().min(16).describe('API authentication key'),

  // Feature flags
  ENABLE_DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false')
    .describe('Enable debug mode'),
  ENABLE_METRICS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('true')
    .describe('Enable metrics collection'),

  // External services
  REDIS_URL: z.string().url().optional().describe('Redis connection URL (optional)'),
  SENDGRID_API_KEY: z.string().optional().describe('SendGrid API key for email (optional)'),
});

// Merge with base schema
const FullSchema = BaseEnvironmentSchema.merge(CustomAppSchema);

console.log('🔧 Generating configuration templates...\n');

// Example 1: Generate .env template
console.log('=== .env Template ===');
const envTemplate = generateEnvTemplate(FullSchema, {
  includeDefaults: true,
  includeComments: true,
  commentPrefix: '#',
});

console.log(envTemplate.content);
console.log(`Generated ${envTemplate.variableCount} variables\n`);

// Example 2: Generate TypeScript types
console.log('=== TypeScript Types ===');
const typesTemplate = generateTypes(FullSchema, {
  includeComments: true,
});

console.log(typesTemplate.content);
console.log(`Generated ${typesTemplate.variableCount} type definitions\n`);

// Example 3: Generate all templates at once
console.log('=== Generating All Templates ===');
const allTemplates = generateAllTemplates(FullSchema, {
  envFile: './generated/.env.template',
  typesFile: './generated/env.types.ts',
  envOptions: {
    includeDefaults: true,
    includeComments: true,
  },
  typesOptions: {
    includeComments: true,
  },
});

console.log('✅ All templates generated successfully!');
console.log(`📁 .env template: ${allTemplates.env.outputFile || 'not saved'}`);
console.log(`📁 TypeScript types: ${allTemplates.types.outputFile || 'not saved'}`);
console.log(`📁 JSON schema: ${allTemplates.jsonSchema.outputFile || 'not saved'}`);

// Example 4: Generate template without defaults
console.log('\n=== .env Template (No Defaults) ===');
const envTemplateNoDefaults = generateEnvTemplate(FullSchema, {
  includeDefaults: false,
  includeComments: true,
});

console.log(envTemplateNoDefaults.content);

// Example 5: Generate template with custom comment prefix
console.log('\n=== .env Template (Custom Comments) ===');
const envTemplateCustom = generateEnvTemplate(FullSchema, {
  includeDefaults: true,
  includeComments: true,
  commentPrefix: '//',
});

console.log(envTemplateCustom.content);

console.log('\n🎉 Template generation complete!');
console.log('\n📝 Usage:');
console.log('1. Copy the .env template to your project');
console.log('2. Fill in your actual values');
console.log('3. Use the TypeScript types for type safety');
console.log('4. Import the types in your application code');
