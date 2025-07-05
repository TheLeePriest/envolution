// Base environment type
export type BaseEnvironment = {
	STAGE: "dev" | "prod" | "test";
	NODE_ENV?: "development" | "production" | "test";
	LOG_LEVEL: "debug" | "info" | "warn" | "error";
};

// AWS environment type
export type AWSEnvironment = {
	AWS_REGION?: string;
	AWS_ACCOUNT_ID?: string;
	STATE_MACHINE_ARN?: string;
	QUOTA_TABLE?: string;
	MODEL_KEY?: string;
	MAX_TOKENS?: number;
	REFILL_RATE_PER_MS?: number;
	ANALYSIS_CACHE_TABLE_NAME?: string;
	JOB_TABLE_NAME?: string;
	LICENSE_TABLE_NAME?: string;
	CACHE_TABLE_NAME?: string;
	TABLE_INDEX?: string;
	QUEUE_URL?: string;
	MODEL_ID?: string;
	EVENT_BUS_NAME?: string;
};

// Security environment type
export type SecurityEnvironment = {
	JWT_SECRET?: string;
	API_KEY?: string;
	ENCRYPTION_KEY?: string;
};

// Combined environment type
export type FullEnvironment = BaseEnvironment &
	AWSEnvironment &
	SecurityEnvironment;

// Generic environment type for custom schemas
export type CustomEnvironment<T = Record<string, unknown>> = BaseEnvironment &
	T;

// Configuration options
export interface EnvironmentConfigOptions {
	strict?: boolean;
	allowUnknown?: boolean;
	context?: string;
}

// Error types
export interface EnvironmentValidationError {
	message: string;
	errors: Array<{
		path: string[];
		message: string;
		code: string;
	}>;
	context?: string;
}
