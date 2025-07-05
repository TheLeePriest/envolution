import type { z } from "zod";
export declare const SecurityEnvironmentSchema: z.ZodObject<
	{
		JWT_SECRET: z.ZodOptional<z.ZodString>;
		JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
		JWT_ISSUER: z.ZodOptional<z.ZodString>;
		API_KEY: z.ZodOptional<z.ZodString>;
		API_SECRET: z.ZodOptional<z.ZodString>;
		ENCRYPTION_KEY: z.ZodOptional<z.ZodString>;
		ENCRYPTION_ALGORITHM: z.ZodDefault<
			z.ZodEnum<["AES-256-GCM", "AES-256-CBC"]>
		>;
		CORS_ORIGIN: z.ZodOptional<z.ZodString>;
		CORS_CREDENTIALS: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>
		>;
		RATE_LIMIT_WINDOW: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>
		>;
		RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>
		>;
		SECURITY_HEADERS_ENABLED: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>
		>;
		HSTS_MAX_AGE: z.ZodDefault<
			z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		JWT_EXPIRES_IN: string;
		ENCRYPTION_ALGORITHM: "AES-256-GCM" | "AES-256-CBC";
		CORS_CREDENTIALS: boolean;
		RATE_LIMIT_WINDOW: number;
		RATE_LIMIT_MAX_REQUESTS: number;
		SECURITY_HEADERS_ENABLED: boolean;
		HSTS_MAX_AGE: number;
		JWT_SECRET?: string | undefined;
		JWT_ISSUER?: string | undefined;
		API_KEY?: string | undefined;
		API_SECRET?: string | undefined;
		ENCRYPTION_KEY?: string | undefined;
		CORS_ORIGIN?: string | undefined;
	},
	{
		JWT_SECRET?: string | undefined;
		JWT_EXPIRES_IN?: string | undefined;
		JWT_ISSUER?: string | undefined;
		API_KEY?: string | undefined;
		API_SECRET?: string | undefined;
		ENCRYPTION_KEY?: string | undefined;
		ENCRYPTION_ALGORITHM?: "AES-256-GCM" | "AES-256-CBC" | undefined;
		CORS_ORIGIN?: string | undefined;
		CORS_CREDENTIALS?: string | undefined;
		RATE_LIMIT_WINDOW?: string | undefined;
		RATE_LIMIT_MAX_REQUESTS?: string | undefined;
		SECURITY_HEADERS_ENABLED?: string | undefined;
		HSTS_MAX_AGE?: string | undefined;
	}
>;
export type SecurityEnvironment = z.infer<typeof SecurityEnvironmentSchema>;
//# sourceMappingURL=security.d.ts.map
