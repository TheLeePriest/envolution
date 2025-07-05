import type { z } from 'zod';
import { EnvironmentConfig } from '../EnvironmentConfig';
export declare function createCustomSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.ZodObject<T>;
export declare function mergeSchemas<T extends z.ZodRawShape, U extends z.ZodRawShape>(schema1: z.ZodObject<T>, schema2: z.ZodObject<U>): z.ZodObject<T & U>;
export declare function createEnvironmentConfig<T extends z.ZodRawShape>(schema: z.ZodObject<T>, options?: Parameters<typeof EnvironmentConfig.getInstance>[1]): EnvironmentConfig<z.infer<typeof schema>>;
//# sourceMappingURL=custom.d.ts.map