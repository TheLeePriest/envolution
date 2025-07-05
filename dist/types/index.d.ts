export type { ConfigChangeEvent, EnvironmentConfigOptions, } from './EnvironmentConfig';
export { EnvironmentConfig } from './EnvironmentConfig';
export { type AWSEnvironment, AWSEnvironmentSchema } from './schemas/aws';
export { type BaseEnvironment, BaseEnvironmentSchema } from './schemas/base';
export { createCustomSchema, createEnvironmentConfig, mergeSchemas, } from './schemas/custom';
export { type SecurityEnvironment, SecurityEnvironmentSchema, } from './schemas/security';
export { generateAllTemplates, generateEnvTemplate, generateJsonSchema, generateTypes, type TemplateOptions, type TemplateResult, } from './templates';
export type { CustomEnvironment, EnvironmentValidationError, FullEnvironment, } from './types';
import { EnvironmentConfig } from './EnvironmentConfig';
export declare const env: EnvironmentConfig<Record<string, unknown>>;
//# sourceMappingURL=index.d.ts.map