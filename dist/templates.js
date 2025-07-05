import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export function generateEnvTemplate(schema, options = {}) {
    const { includeDefaults = true, includeComments = true, outputFile, commentPrefix = '#', createDirectories = true, } = options;
    const shape = schema.shape;
    const lines = [];
    const variables = [];
    if (includeComments) {
        lines.push(`${commentPrefix} Environment Configuration Template`);
        lines.push(`${commentPrefix} Generated from schema`);
        lines.push(`${commentPrefix}`);
        lines.push(`${commentPrefix} Copy this file to .env and fill in your values`);
        lines.push('');
    }
    for (const [key, field] of Object.entries(shape)) {
        variables.push(key);
        if (includeComments) {
            const description = getFieldDescription(field);
            if (description) {
                lines.push(`${commentPrefix} ${description}`);
            }
        }
        if (includeDefaults && 'defaultValue' in field && field.defaultValue !== undefined) {
            lines.push(`${key}=${field.defaultValue}`);
        }
        else {
            lines.push(`${key}=`);
        }
        lines.push('');
    }
    const content = lines.join('\n');
    if (outputFile) {
        const fullPath = resolve(outputFile);
        if (createDirectories) {
            mkdirSync(dirname(fullPath), { recursive: true });
        }
        writeFileSync(fullPath, content, 'utf8');
    }
    return {
        content,
        outputFile,
        variableCount: variables.length,
        variables,
    };
}
export function generateTypes(schema, options = {}) {
    const { outputFile, createDirectories = true } = options;
    const shape = schema.shape;
    const lines = [];
    const variables = [];
    lines.push('// Generated TypeScript types from environment schema');
    lines.push('// This file is auto-generated - do not edit manually');
    lines.push('');
    lines.push('export interface EnvironmentConfig {');
    for (const [key, field] of Object.entries(shape)) {
        variables.push(key);
        const type = getTypeScriptType(field);
        const isOptional = isFieldOptional(field);
        const comment = getFieldDescription(field);
        if (comment) {
            lines.push(`  /** ${comment} */`);
        }
        lines.push(`  ${key}${isOptional ? '?' : ''}: ${type};`);
    }
    lines.push('}');
    lines.push('');
    const content = lines.join('\n');
    if (outputFile) {
        const fullPath = resolve(outputFile);
        if (createDirectories) {
            mkdirSync(dirname(fullPath), { recursive: true });
        }
        writeFileSync(fullPath, content, 'utf8');
    }
    return {
        content,
        outputFile,
        variableCount: variables.length,
        variables,
    };
}
export function generateJsonSchema(schema, options = {}) {
    const { outputFile, createDirectories = true } = options;
    const jsonSchema = {
        type: 'object',
        properties: {},
        required: [],
    };
    const variables = Object.keys(schema.shape);
    for (const key of variables) {
        jsonSchema.properties[key] = { type: 'string' };
    }
    const content = JSON.stringify(jsonSchema, null, 2);
    if (outputFile) {
        const fullPath = resolve(outputFile);
        if (createDirectories) {
            mkdirSync(dirname(fullPath), { recursive: true });
        }
        writeFileSync(fullPath, content, 'utf8');
    }
    return {
        content,
        outputFile,
        variableCount: variables.length,
        variables,
    };
}
function getFieldDescription(field) {
    if (field.description) {
        return field.description;
    }
    const fieldName = field._def?.typeName || '';
    switch (fieldName) {
        case 'ZodString':
            return 'String value';
        case 'ZodNumber':
            return 'Numeric value';
        case 'ZodBoolean':
            return 'Boolean value (true/false)';
        case 'ZodEnum':
            return 'Enum value';
        default:
            return null;
    }
}
function getTypeScriptType(field) {
    const fieldName = field._def?.typeName || '';
    switch (fieldName) {
        case 'ZodString':
            return 'string';
        case 'ZodNumber':
            return 'number';
        case 'ZodBoolean':
            return 'boolean';
        case 'ZodEnum': {
            const values = field._def?.values || [];
            return values.map((v) => `'${v}'`).join(' | ');
        }
        case 'ZodOptional':
            return getTypeScriptType(field._def.innerType);
        case 'ZodDefault':
            return getTypeScriptType(field._def.innerType);
        case 'ZodUnion':
            return field._def.options.map(getTypeScriptType).join(' | ');
        default:
            return 'unknown';
    }
}
function isFieldOptional(field) {
    const fieldName = field._def?.typeName || '';
    return fieldName === 'ZodOptional' || fieldName === 'ZodDefault';
}
export function generateAllTemplates(schema, options = {}) {
    const env = generateEnvTemplate(schema, {
        ...(options.envFile && { outputFile: options.envFile }),
        ...options.envOptions,
    });
    const types = generateTypes(schema, {
        ...(options.typesFile && { outputFile: options.typesFile }),
        ...options.typesOptions,
    });
    const jsonSchema = generateJsonSchema(schema, {
        ...(options.jsonSchemaFile && { outputFile: options.jsonSchemaFile }),
        ...options.jsonSchemaOptions,
    });
    return { env, types, jsonSchema };
}
//# sourceMappingURL=templates.js.map