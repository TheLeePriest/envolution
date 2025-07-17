// Main exports

export type {
  ConfigChangeEvent,
  EnvironmentConfigOptions,
} from './EnvironmentConfig';
export { EnvironmentConfig } from './EnvironmentConfig';
export { type AWSEnvironment, AWSEnvironmentSchema } from './schemas/aws';
// Schema exports
export { type BaseEnvironment, BaseEnvironmentSchema } from './schemas/base';
// Utility exports
export {
  createCustomSchema,
  createEnvironmentConfig,
  mergeSchemas,
} from './schemas/custom';
export {
  type SecurityEnvironment,
  SecurityEnvironmentSchema,
} from './schemas/security';

// Template generation exports
export {
  generateAllTemplates,
  generateEnvTemplate,
  generateJsonSchema,
  generateTypes,
  type TemplateOptions,
  type TemplateResult,
} from './templates';

// Type exports
export type {
  CustomEnvironment,
  EnvironmentValidationError,
  FullEnvironment,
} from './types';

// Convenience exports
// Note: Use EnvironmentConfig.getInstance() directly to configure options like suppressWarnings
// export const env = EnvironmentConfig.getInstance(); // Removed to prevent automatic initialization
