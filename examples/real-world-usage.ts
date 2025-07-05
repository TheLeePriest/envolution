import {
	BaseEnvironmentSchema,
	createEnvironmentConfig,
	mergeSchemas,
} from "../src";
import { z } from "zod";

// Example 1: Basic usage with default schema
console.log("=== Basic Usage ===");
const basicEnv = createEnvironmentConfig(BaseEnvironmentSchema);

console.log(`Stage: ${basicEnv.stage}`);
console.log(`Is Production: ${basicEnv.isProduction}`);
console.log(`Log Level: ${basicEnv.get("LOG_LEVEL")}`);

// Example 2: Custom schema for a web application
console.log("\n=== Web Application ===");
const WebAppSchema = z.object({
	PORT: z.string().transform(Number).default("3000"),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32),
	REDIS_URL: z.string().url().optional(),
	SENDGRID_API_KEY: z.string().optional(),
	CORS_ORIGIN: z.string().url().optional(),
});

const webAppSchema = mergeSchemas(BaseEnvironmentSchema, WebAppSchema);
const webAppEnv = createEnvironmentConfig(webAppSchema);

// Validate at startup
try {
	webAppEnv.validateStartup();
	console.log("✅ Web app environment validated");
} catch (error) {
	console.error("❌ Web app environment validation failed:", error);
}

// Example 3: AWS Lambda with custom variables
console.log("\n=== AWS Lambda ===");
const LambdaSchema = z.object({
	DYNAMODB_TABLE: z.string(),
	S3_BUCKET: z.string(),
	SQS_QUEUE_URL: z.string().url(),
	LAMBDA_TIMEOUT: z.string().transform(Number).default("30"),
});

const lambdaSchema = mergeSchemas(BaseEnvironmentSchema, LambdaSchema);
const lambdaEnv = createEnvironmentConfig(lambdaSchema);

// Lambda handler example
export const lambdaHandler = async (event: Record<string, unknown>) => {
	const tableName = lambdaEnv.getRequired("DYNAMODB_TABLE", "DynamoDB table");
	const bucketName = lambdaEnv.getRequired("S3_BUCKET", "S3 bucket");
	const timeout = lambdaEnv.get("LAMBDA_TIMEOUT");

	console.log(
		`Processing with table: ${tableName}, bucket: ${bucketName}, timeout: ${timeout}s`,
	);

	return { statusCode: 200, body: "Success" };
};

// Example 4: Microservice with database and external APIs
console.log("\n=== Microservice ===");
const MicroserviceSchema = z.object({
	SERVICE_NAME: z.string().default("user-service"),
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),
	EXTERNAL_API_URL: z.string().url(),
	API_KEY: z.string(),
	RATE_LIMIT: z.string().transform(Number).default("100"),
	CACHE_TTL: z.string().transform(Number).default("3600"),
});

const microserviceSchema = mergeSchemas(
	BaseEnvironmentSchema,
	MicroserviceSchema,
);
const microserviceEnv = createEnvironmentConfig(microserviceSchema);

// Service initialization
class UserService {
	private env = microserviceEnv;

	constructor() {
		this.validateEnvironment();
	}

	private validateEnvironment() {
		try {
			this.env.validateStartup();
			console.log(`✅ ${this.env.get("SERVICE_NAME")} environment validated`);
		} catch (error) {
			console.error("❌ Service environment validation failed:", error);
			throw error;
		}
	}

	async initialize() {
		const dbUrl = this.env.getRequired("DATABASE_URL", "Database connection");
		const redisUrl = this.env.getRequired("REDIS_URL", "Redis connection");
		const apiUrl = this.env.getRequired("EXTERNAL_API_URL", "External API");
		const rateLimit = this.env.get("RATE_LIMIT");

		console.log(`🚀 Initializing ${this.env.get("SERVICE_NAME")}`);
		console.log(`📊 Rate limit: ${rateLimit} requests/min`);
		console.log(`⏱️  Cache TTL: ${this.env.get("CACHE_TTL")}s`);

		// Initialize connections here...
		return { dbUrl, redisUrl, apiUrl };
	}

	async processRequest(userId: string) {
		if (this.env.isDevelopment) {
			console.log("🔍 Development mode - using mock data");
			return { userId, status: "mock" };
		}

		console.log("🚀 Production mode - processing real request");
		return { userId, status: "processed" };
	}
}

// Example 5: Environment-specific configuration
console.log("\n=== Environment-Specific Config ===");
const config = {
	development: {
		logLevel: "debug",
		enableDebug: true,
		mockExternalApis: true,
	},
	production: {
		logLevel: "info",
		enableDebug: false,
		mockExternalApis: false,
	},
	test: {
		logLevel: "warn",
		enableDebug: false,
		mockExternalApis: true,
	},
};

const currentConfig = config[basicEnv.stage];
console.log(`Current config for ${basicEnv.stage}:`, currentConfig);

// Example 6: Error handling with detailed messages
console.log("\n=== Error Handling ===");
try {
	// This will fail if SERVICE_NAME is not set
	const serviceName = basicEnv.getRequired("SERVICE_NAME", "Service name");
	console.log("Service Name:", serviceName);
} catch (error) {
	console.error("Error getting required variable:", error);
}

// Example 7: Getting all configuration
console.log("\n=== All Configuration ===");
const allConfig = basicEnv.getAll();
console.log("All environment variables:", allConfig);

// Example 8: Type-safe environment checks
console.log("\n=== Type-Safe Checks ===");
if (basicEnv.isProduction) {
	console.log("🔒 Production mode - strict security enabled");
} else if (basicEnv.isDevelopment) {
	console.log("🔧 Development mode - debug features enabled");
} else {
	console.log("🧪 Test mode - using test data");
}

console.log("\n=== Examples Complete ===");
