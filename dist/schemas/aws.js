import { z } from "zod";
export const AWSEnvironmentSchema = z.object({
	AWS_REGION: z.string().optional(),
	AWS_ACCOUNT_ID: z.string().optional(),
	STATE_MACHINE_ARN: z.string().min(1).optional(),
	QUOTA_TABLE: z.string().min(1).optional(),
	MODEL_KEY: z.string().min(1).optional(),
	MAX_TOKENS: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.optional(),
	REFILL_RATE_PER_MS: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.optional(),
	ANALYSIS_CACHE_TABLE_NAME: z.string().min(1).optional(),
	JOB_TABLE_NAME: z.string().min(1).optional(),
	LICENSE_TABLE_NAME: z.string().min(1).optional(),
	CACHE_TABLE_NAME: z.string().min(1).optional(),
	TABLE_INDEX: z.string().min(1).optional(),
	QUEUE_URL: z.string().url().optional(),
	MODEL_ID: z.string().min(1).optional(),
	EVENT_BUS_NAME: z.string().min(1).optional(),
	S3_BUCKET: z.string().min(1).optional(),
	DYNAMODB_TABLE: z.string().min(1).optional(),
	SQS_QUEUE_URL: z.string().url().optional(),
	SNS_TOPIC_ARN: z.string().min(1).optional(),
	LAMBDA_FUNCTION_NAME: z.string().min(1).optional(),
	LAMBDA_TIMEOUT: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("30"),
	LAMBDA_MEMORY_SIZE: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("128"),
});
//# sourceMappingURL=aws.js.map
