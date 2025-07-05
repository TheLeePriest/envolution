import { z } from 'zod';
import { BaseEnvironmentSchema, EnvironmentConfig, mergeSchemas } from '../src';

// Define Next.js specific schema
const NextJSSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('My App'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  REDIS_URL: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().optional(),
});

// Merge schemas
const AppSchema = mergeSchemas(BaseEnvironmentSchema, NextJSSchema);

// Initialize environment config
const env = EnvironmentConfig.getInstance(AppSchema as z.ZodType<Record<string, unknown>>);

// Validate at startup (in _app.tsx or similar)
try {
  env.validateStartup();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  // In Next.js, you might want to show an error page instead of exiting
}

// Example: API route handler (pages/api/users.ts or app/api/users/route.ts)
export async function GET() {
  try {
    const _apiUrl = env.getRequired('NEXT_PUBLIC_API_URL', 'API URL');
    const _jwtSecret = env.getRequired('JWT_SECRET', 'JWT authentication');

    // Environment-specific logic
    if (env.isDevelopment) {
      console.log('🔍 Development mode - using mock data');
      return Response.json({ users: [] });
    }

    // Production logic
    console.log('🚀 Production mode - fetching from database');
    return Response.json({ users: [] });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Example: Client-side component (only use NEXT_PUBLIC_ prefixed vars)
export function EnvironmentInfo() {
  const apiUrl = env.get('NEXT_PUBLIC_API_URL');
  const appName = env.get('NEXT_PUBLIC_APP_NAME');

  // Return environment info object (for use in components)
  return {
    apiUrl,
    appName,
    stage: env.stage,
    isProduction: env.isProduction,
  };
}

// Example: Server-side component or getServerSideProps
export async function getServerSideProps() {
  const _databaseUrl = env.getRequired('DATABASE_URL', 'Database connection');
  const redisUrl = env.get('REDIS_URL');

  return {
    props: {
      databaseConnected: true,
      redisConnected: !!redisUrl,
      environment: env.stage,
    },
  };
}
