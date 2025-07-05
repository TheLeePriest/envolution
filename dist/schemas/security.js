import { z } from "zod";
export const SecurityEnvironmentSchema = z.object({
	JWT_SECRET: z
		.string()
		.min(32, "JWT secret must be at least 32 characters")
		.optional(),
	JWT_EXPIRES_IN: z.string().default("24h"),
	JWT_ISSUER: z.string().optional(),
	API_KEY: z.string().min(1).optional(),
	API_SECRET: z.string().min(1).optional(),
	ENCRYPTION_KEY: z.string().min(32).optional(),
	ENCRYPTION_ALGORITHM: z
		.enum(["AES-256-GCM", "AES-256-CBC"])
		.default("AES-256-GCM"),
	CORS_ORIGIN: z.string().optional(),
	CORS_CREDENTIALS: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default("false"),
	RATE_LIMIT_WINDOW: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("900000"),
	RATE_LIMIT_MAX_REQUESTS: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("100"),
	SECURITY_HEADERS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default("true"),
	HSTS_MAX_AGE: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("31536000"),
});
//# sourceMappingURL=security.js.map
