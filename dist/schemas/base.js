import { z } from 'zod';
export const BaseEnvironmentSchema = z.object({
    STAGE: z.enum(['dev', 'prod', 'test']).default('dev'),
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    SERVICE_NAME: z.string().min(1).optional(),
    VERSION: z.string().optional(),
    ENABLE_DEBUG: z
        .string()
        .transform((val) => val === 'true')
        .pipe(z.boolean())
        .default('false'),
    ENABLE_METRICS: z
        .string()
        .transform((val) => val === 'true')
        .pipe(z.boolean())
        .default('true'),
    REQUEST_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('30000'),
    MAX_RETRIES: z.string().transform(Number).pipe(z.number().int().min(0)).default('3'),
});
//# sourceMappingURL=base.js.map