import { EnvironmentConfig } from '../EnvironmentConfig';
export function createCustomSchema(schema) {
    return schema;
}
export function mergeSchemas(schema1, schema2) {
    return schema1.merge(schema2);
}
export function createEnvironmentConfig(schema, options) {
    return EnvironmentConfig.getInstance(schema, options);
}
//# sourceMappingURL=custom.js.map