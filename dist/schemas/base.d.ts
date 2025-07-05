import { z } from "zod";
export declare const BaseEnvironmentSchema: z.ZodObject<
	{
		STAGE: z.ZodDefault<z.ZodEnum<["dev", "prod", "test"]>>;
		NODE_ENV: z.ZodOptional<z.ZodEnum<["development", "production", "test"]>>;
		LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
		SERVICE_NAME: z.ZodOptional<z.ZodString>;
		VERSION: z.ZodOptional<z.ZodString>;
		ENABLE_DEBUG: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>
		>;
		ENABLE_METRICS: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>
		>;
		REQUEST_TIMEOUT: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>
		>;
		MAX_RETRIES: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		STAGE: "dev" | "prod" | "test";
		LOG_LEVEL: "debug" | "info" | "warn" | "error";
		ENABLE_DEBUG: boolean;
		ENABLE_METRICS: boolean;
		REQUEST_TIMEOUT: number;
		MAX_RETRIES: number;
		NODE_ENV?: "test" | "development" | "production" | undefined;
		SERVICE_NAME?: string | undefined;
		VERSION?: string | undefined;
	},
	{
		STAGE?: "dev" | "prod" | "test" | undefined;
		NODE_ENV?: "test" | "development" | "production" | undefined;
		LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
		SERVICE_NAME?: string | undefined;
		VERSION?: string | undefined;
		ENABLE_DEBUG?: string | undefined;
		ENABLE_METRICS?: string | undefined;
		REQUEST_TIMEOUT?: string | undefined;
		MAX_RETRIES?: string | undefined;
	}
>;
export type BaseEnvironment = z.infer<typeof BaseEnvironmentSchema>;
//# sourceMappingURL=base.d.ts.map
