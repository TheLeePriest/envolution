import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
	AWSEnvironmentSchema,
	BaseEnvironmentSchema,
	EnvironmentConfig,
	mergeSchemas,
} from "../src";

describe("Schema Validation", () => {
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		originalEnv = { ...process.env };
		EnvironmentConfig.reset();
	});

	afterEach(() => {
		process.env = originalEnv;
		EnvironmentConfig.reset();
	});

	describe("BaseEnvironmentSchema", () => {
		it("should validate environment with BaseEnvironmentSchema", () => {
			process.env.STAGE = "prod";
			process.env.LOG_LEVEL = "debug";
			process.env.ENABLE_DEBUG = "true";
			process.env.REQUEST_TIMEOUT = "5000";
			process.env.MAX_RETRIES = "3";

			const env = EnvironmentConfig.getInstance(BaseEnvironmentSchema);

			expect(env.get("STAGE")).toBe("prod");
			expect(env.get("LOG_LEVEL")).toBe("debug");
			expect(env.get("ENABLE_DEBUG")).toBe(true);
			expect(env.get("REQUEST_TIMEOUT")).toBe(5000);
			expect(env.get("MAX_RETRIES")).toBe(3);
		});

		it("should use default values when environment variables are not set", () => {
			const env = EnvironmentConfig.getInstance(BaseEnvironmentSchema);

			expect(env.get("STAGE")).toBe("dev");
			expect(env.get("LOG_LEVEL")).toBe("info");
			expect(env.get("ENABLE_DEBUG")).toBe(false);
			expect(env.get("ENABLE_METRICS")).toBe(true);
			expect(env.get("REQUEST_TIMEOUT")).toBe(30000);
			expect(env.get("MAX_RETRIES")).toBe(3);
		});

		it("should throw validation error for invalid values", () => {
			process.env.STAGE = "invalid";
			process.env.LOG_LEVEL = "invalid";

			expect(() => {
				EnvironmentConfig.getInstance(BaseEnvironmentSchema);
			}).toThrow("Environment validation failed");
		});
	});

	describe("AWSEnvironmentSchema", () => {
		it("should validate AWS schema correctly", () => {
			process.env.AWS_REGION = "us-east-1";
			process.env.LAMBDA_TIMEOUT = "60";
			process.env.LAMBDA_MEMORY_SIZE = "256";

			const env = EnvironmentConfig.getInstance(AWSEnvironmentSchema);

			expect(env.get("AWS_REGION")).toBe("us-east-1");
			expect(env.get("LAMBDA_TIMEOUT")).toBe(60);
			expect(env.get("LAMBDA_MEMORY_SIZE")).toBe(256);
		});

		it("should use AWS schema defaults", () => {
			const env = EnvironmentConfig.getInstance(AWSEnvironmentSchema);

			expect(env.get("LAMBDA_TIMEOUT")).toBe(30);
			expect(env.get("LAMBDA_MEMORY_SIZE")).toBe(128);
		});
	});

	describe("Schema Merging", () => {
		it("should merge schemas correctly", () => {
			process.env.STAGE = "prod";
			process.env.AWS_REGION = "us-west-2";
			process.env.LAMBDA_TIMEOUT = "120";

			const mergedSchema = mergeSchemas(
				BaseEnvironmentSchema,
				AWSEnvironmentSchema,
			);
			const env = EnvironmentConfig.getInstance(mergedSchema);

			expect(env.get("STAGE")).toBe("prod");
			expect(env.get("AWS_REGION")).toBe("us-west-2");
			expect(env.get("LAMBDA_TIMEOUT")).toBe(120);
		});
	});

	describe("Custom Schemas", () => {
		it("should work with custom schemas", () => {
			const CustomSchema = z.object({
				CUSTOM_VAR: z.string().min(1),
				CUSTOM_NUMBER: z.string().transform(Number).pipe(z.number().positive()),
			});

			process.env.CUSTOM_VAR = "custom_value";
			process.env.CUSTOM_NUMBER = "42";

			const env = EnvironmentConfig.getInstance(CustomSchema);

			expect(env.get("CUSTOM_VAR")).toBe("custom_value");
			expect(env.get("CUSTOM_NUMBER")).toBe(42);
		});
	});

	describe("Error Handling", () => {
		it("should handle Zod validation errors gracefully", () => {
			process.env.REQUEST_TIMEOUT = "invalid_number";

			expect(() => {
				EnvironmentConfig.getInstance(BaseEnvironmentSchema);
			}).toThrow("Environment validation failed");
		});
	});
});
