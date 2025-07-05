export { EnvironmentConfig } from "./EnvironmentConfig";
export { BaseEnvironmentSchema } from "./schemas/base";
export { AWSEnvironmentSchema } from "./schemas/aws";
export { SecurityEnvironmentSchema } from "./schemas/security";
export {
	createCustomSchema,
	mergeSchemas,
	createEnvironmentConfig,
} from "./schemas/custom";
export {
	generateEnvTemplate,
	generateTypes,
	generateJsonSchema,
	generateAllTemplates,
} from "./templates";
import { EnvironmentConfig } from "./EnvironmentConfig";
export const env = EnvironmentConfig.getInstance();
//# sourceMappingURL=index.js.map
