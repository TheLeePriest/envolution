// Main exports
export { EnvironmentConfig } from "./EnvironmentConfig";
export type {
	EnvironmentConfigOptions,
	ConfigChangeEvent,
} from "./EnvironmentConfig";

// Schema exports
export { BaseEnvironmentSchema, type BaseEnvironment } from "./schemas/base";
export { AWSEnvironmentSchema, type AWSEnvironment } from "./schemas/aws";
export {
	SecurityEnvironmentSchema,
	type SecurityEnvironment,
} from "./schemas/security";

// Utility exports
export {
	createCustomSchema,
	mergeSchemas,
	createEnvironmentConfig,
} from "./schemas/custom";

// Template generation exports
export {
	generateEnvTemplate,
	generateTypes,
	generateJsonSchema,
	generateAllTemplates,
	type TemplateOptions,
	type TemplateResult,
} from "./templates";

// Type exports
export type {
	FullEnvironment,
	CustomEnvironment,
	EnvironmentValidationError,
} from "./types";

// Convenience exports
import { EnvironmentConfig } from "./EnvironmentConfig";
export const env = EnvironmentConfig.getInstance();
