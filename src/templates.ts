import type { z } from "zod";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

/**
 * Options for template generation
 */
export interface TemplateOptions {
	/** Include default values in template */
	includeDefaults?: boolean;
	/** Include comments in template */
	includeComments?: boolean;
	/** Output file path */
	outputFile?: string;
	/** Template format */
	format?: "env" | "typescript" | "json";
	/** Custom comment prefix for env files */
	commentPrefix?: string;
	/** Whether to create directories if they don't exist */
	createDirectories?: boolean;
}

/**
 * Template generation result
 */
export interface TemplateResult {
	/** Generated template content */
	content: string;
	/** Output file path (if specified) */
	outputFile: string | undefined;
	/** Number of variables in template */
	variableCount: number;
	/** List of variable names */
	variables: string[];
}

/**
 * Generate .env template from schema
 */
export function generateEnvTemplate<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
	options: Partial<TemplateOptions> = {},
): TemplateResult {
	const {
		includeDefaults = true,
		includeComments = true,
		outputFile,
		commentPrefix = "#",
		createDirectories = true,
	} = options;

	const shape = schema.shape;
	const lines: string[] = [];
	const variables: string[] = [];

	// Add header comment
	if (includeComments) {
		lines.push(`${commentPrefix} Environment Configuration Template`);
		lines.push(`${commentPrefix} Generated from schema`);
		lines.push(`${commentPrefix}`);
		lines.push(
			`${commentPrefix} Copy this file to .env and fill in your values`,
		);
		lines.push("");
	}

	// Process each field in the schema
	for (const [key, field] of Object.entries(shape)) {
		variables.push(key);

		// Add comment for the field
		if (includeComments) {
			const description = getFieldDescription(field);
			if (description) {
				lines.push(`${commentPrefix} ${description}`);
			}
		}

		// Add the variable with optional default value
		if (
			includeDefaults &&
			"defaultValue" in field &&
			field.defaultValue !== undefined
		) {
			lines.push(`${key}=${field.defaultValue}`);
		} else {
			lines.push(`${key}=`);
		}

		lines.push("");
	}

	const content = lines.join("\n");

	// Write to file if specified
	if (outputFile) {
		const fullPath = resolve(outputFile);
		if (createDirectories) {
			mkdirSync(dirname(fullPath), { recursive: true });
		}
		writeFileSync(fullPath, content, "utf8");
	}

	return {
		content,
		outputFile,
		variableCount: variables.length,
		variables,
	};
}

/**
 * Generate TypeScript types from schema
 */
export function generateTypes<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
	options: Partial<TemplateOptions> = {},
): TemplateResult {
	const { outputFile, createDirectories = true } = options;

	const shape = schema.shape;
	const lines: string[] = [];
	const variables: string[] = [];

	// Add header
	lines.push("// Generated TypeScript types from environment schema");
	lines.push("// This file is auto-generated - do not edit manually");
	lines.push("");
	lines.push("export interface EnvironmentConfig {");

	// Process each field
	for (const [key, field] of Object.entries(shape)) {
		variables.push(key);
		const type = getTypeScriptType(field);
		const isOptional = isFieldOptional(field);
		const comment = getFieldDescription(field);

		if (comment) {
			lines.push(`  /** ${comment} */`);
		}
		lines.push(`  ${key}${isOptional ? "?" : ""}: ${type};`);
	}

	lines.push("}");
	lines.push("");

	const content = lines.join("\n");

	// Write to file if specified
	if (outputFile) {
		const fullPath = resolve(outputFile);
		if (createDirectories) {
			mkdirSync(dirname(fullPath), { recursive: true });
		}
		writeFileSync(fullPath, content, "utf8");
	}

	return {
		content,
		outputFile,
		variableCount: variables.length,
		variables,
	};
}

/**
 * Generate JSON schema from Zod schema
 * Note: This requires @anatine/zod-openapi or similar package for toJSONSchema
 */
export function generateJsonSchema<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
	options: Partial<TemplateOptions> = {},
): TemplateResult {
	const { outputFile, createDirectories = true } = options;

	// For now, generate a simple JSON structure
	const jsonSchema = {
		type: "object",
		properties: {} as Record<string, unknown>,
		required: [] as string[],
	};

	const variables = Object.keys(schema.shape);

	// Add basic property types
	for (const key of variables) {
		jsonSchema.properties[key] = { type: "string" };
	}

	const content = JSON.stringify(jsonSchema, null, 2);

	// Write to file if specified
	if (outputFile) {
		const fullPath = resolve(outputFile);
		if (createDirectories) {
			mkdirSync(dirname(fullPath), { recursive: true });
		}
		writeFileSync(fullPath, content, "utf8");
	}

	return {
		content,
		outputFile,
		variableCount: variables.length,
		variables,
	};
}

/**
 * Get field description from Zod schema
 */
function getFieldDescription(field: z.ZodTypeAny): string | null {
	// Try to extract description from various sources
	if (field.description) {
		return field.description;
	}

	// Check for common patterns in field name
	const fieldName = field._def?.typeName || "";

	switch (fieldName) {
		case "ZodString":
			return "String value";
		case "ZodNumber":
			return "Numeric value";
		case "ZodBoolean":
			return "Boolean value (true/false)";
		case "ZodEnum":
			return "Enum value";
		default:
			return null;
	}
}

/**
 * Get TypeScript type from Zod field
 */
function getTypeScriptType(field: z.ZodTypeAny): string {
	const fieldName = field._def?.typeName || "";

	switch (fieldName) {
		case "ZodString":
			return "string";
		case "ZodNumber":
			return "number";
		case "ZodBoolean":
			return "boolean";
		case "ZodEnum": {
			const values = field._def?.values || [];
			return values.map((v: unknown) => `'${v}'`).join(" | ");
		}
		case "ZodOptional":
			return getTypeScriptType(field._def.innerType);
		case "ZodDefault":
			return getTypeScriptType(field._def.innerType);
		case "ZodUnion":
			return field._def.options.map(getTypeScriptType).join(" | ");
		default:
			return "unknown";
	}
}

/**
 * Check if field is optional
 */
function isFieldOptional(field: z.ZodTypeAny): boolean {
	const fieldName = field._def?.typeName || "";
	return fieldName === "ZodOptional" || fieldName === "ZodDefault";
}

/**
 * Generate all templates from a schema
 */
export function generateAllTemplates<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
	options: {
		envFile?: string;
		typesFile?: string;
		jsonSchemaFile?: string;
		envOptions?: TemplateOptions;
		typesOptions?: TemplateOptions;
		jsonSchemaOptions?: TemplateOptions;
	} = {},
): {
	env: TemplateResult;
	types: TemplateResult;
	jsonSchema: TemplateResult;
} {
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
