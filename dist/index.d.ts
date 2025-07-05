export { EnvironmentConfig } from './EnvironmentConfig';
export type {
  EnvironmentConfigOptions,
  ConfigChangeEvent,
} from './EnvironmentConfig';
export { BaseEnvironmentSchema, type BaseEnvironment } from './schemas/base';
export { AWSEnvironmentSchema, type AWSEnvironment } from './schemas/aws';
export {
  SecurityEnvironmentSchema,
  type SecurityEnvironment,
} from './schemas/security';
export {
  createCustomSchema,
  mergeSchemas,
  createEnvironmentConfig,
} from './schemas/custom';
export {
  generateEnvTemplate,
  generateTypes,
  generateJsonSchema,
  generateAllTemplates,
  type TemplateOptions,
  type TemplateResult,
} from './templates';
export type {
  FullEnvironment,
  CustomEnvironment,
  EnvironmentValidationError,
} from './types';
import type { EnvironmentConfig } from './EnvironmentConfig';
export declare const env: EnvironmentConfig<Record<string, unknown>>;
//# sourceMappingURL=index.d.ts.map
