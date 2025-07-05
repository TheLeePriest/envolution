import { z } from "zod";

/**
 * Security-related environment schema
 */
export const SecurityEnvironmentSchema = z.object({
	// JWT and Authentication
	JWT_SECRET: z
		.string()
		.min(32, "JWT secret must be at least 32 characters")
		.optional(),
	JWT_EXPIRES_IN: z.string().default("24h"),
	JWT_ISSUER: z.string().optional(),

	// API Keys and Tokens
	API_KEY: z.string().min(1).optional(),
	API_SECRET: z.string().min(1).optional(),

	// Encryption
	ENCRYPTION_KEY: z.string().min(32).optional(),
	ENCRYPTION_ALGORITHM: z
		.enum(["AES-256-GCM", "AES-256-CBC"])
		.default("AES-256-GCM"),

	// CORS and Security Headers
	CORS_ORIGIN: z.string().optional(),
	CORS_CREDENTIALS: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default("false"),

	// Rate Limiting
	RATE_LIMIT_WINDOW: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("900000"), // 15 minutes
	RATE_LIMIT_MAX_REQUESTS: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("100"),

	// Security Headers
	SECURITY_HEADERS_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default("true"),
	HSTS_MAX_AGE: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("31536000"), // 1 year
});

export type SecurityEnvironment = z.infer<typeof SecurityEnvironmentSchema>;
