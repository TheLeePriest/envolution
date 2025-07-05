import type { z } from 'zod';
export interface TemplateOptions {
    includeDefaults?: boolean;
    includeComments?: boolean;
    outputFile?: string;
    format?: 'env' | 'typescript' | 'json';
    commentPrefix?: string;
    createDirectories?: boolean;
}
export interface TemplateResult {
    content: string;
    outputFile: string | undefined;
    variableCount: number;
    variables: string[];
}
export declare function generateEnvTemplate<T extends z.ZodRawShape>(schema: z.ZodObject<T>, options?: Partial<TemplateOptions>): TemplateResult;
export declare function generateTypes<T extends z.ZodRawShape>(schema: z.ZodObject<T>, options?: Partial<TemplateOptions>): TemplateResult;
export declare function generateJsonSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>, options?: Partial<TemplateOptions>): TemplateResult;
export declare function generateAllTemplates<T extends z.ZodRawShape>(schema: z.ZodObject<T>, options?: {
    envFile?: string;
    typesFile?: string;
    jsonSchemaFile?: string;
    envOptions?: TemplateOptions;
    typesOptions?: TemplateOptions;
    jsonSchemaOptions?: TemplateOptions;
}): {
    env: TemplateResult;
    types: TemplateResult;
    jsonSchema: TemplateResult;
};
//# sourceMappingURL=templates.d.ts.map