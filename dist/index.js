export { EnvironmentConfig } from './EnvironmentConfig';
export { AWSEnvironmentSchema } from './schemas/aws';
export { BaseEnvironmentSchema } from './schemas/base';
export { createCustomSchema, createEnvironmentConfig, mergeSchemas, } from './schemas/custom';
export { SecurityEnvironmentSchema, } from './schemas/security';
export { generateAllTemplates, generateEnvTemplate, generateJsonSchema, generateTypes, } from './templates';
import { EnvironmentConfig } from './EnvironmentConfig';
export const env = EnvironmentConfig.getInstance();
//# sourceMappingURL=index.js.map