import type { z } from 'zod';
import { EnvironmentConfig } from '../EnvironmentConfig';

/**
 * Utility functions for creating and merging custom schemas
 */

/**
 * Creates a custom schema with proper typing
 */
export function createCustomSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<T> {
  return schema;
}

/**
 * Merges two schemas together
 */
export function mergeSchemas<T extends z.ZodRawShape, U extends z.ZodRawShape>(
  schema1: z.ZodObject<T>,
  schema2: z.ZodObject<U>
): z.ZodObject<T & U> {
  return schema1.merge(schema2) as z.ZodObject<T & U>;
}

/**
 * Creates an environment config instance with proper type inference
 * This avoids the need for type casting when using schemas with defaults
 */
export function createEnvironmentConfig<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  options?: Parameters<typeof EnvironmentConfig.getInstance>[1]
): EnvironmentConfig<z.infer<typeof schema>> {
  return EnvironmentConfig.getInstance(schema, options) as EnvironmentConfig<
    z.infer<typeof schema>
  >;
}
