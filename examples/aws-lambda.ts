import type { z } from 'zod';
import {
  AWSEnvironmentSchema,
  BaseEnvironmentSchema,
  EnvironmentConfig,
  mergeSchemas,
} from '../src';

// Create schema for AWS Lambda
const LambdaSchema = mergeSchemas(BaseEnvironmentSchema, AWSEnvironmentSchema);

// Get environment config
const env = EnvironmentConfig.getInstance(LambdaSchema as z.ZodType<Record<string, unknown>>);

// Lambda handler
export const handler = async (_event: Record<string, unknown>) => {
  try {
    // Get AWS-specific environment variables
    const stage = env.stage;
    const region = env.get('AWS_REGION');
    const stateMachineArn = env.getRequired('STATE_MACHINE_ARN', 'Step Function');
    const jobTableName = env.getRequired('JOB_TABLE_NAME', 'Job table');

    // Get Lambda-specific variables
    const timeout = env.get('LAMBDA_TIMEOUT'); // number
    const memorySize = env.get('LAMBDA_MEMORY_SIZE'); // number

    console.log(`Processing in ${stage} environment`);
    console.log(`AWS Region: ${region}`);
    console.log(`State Machine ARN: ${stateMachineArn}`);
    console.log(`Job Table: ${jobTableName}`);
    console.log(`Lambda Timeout: ${timeout}s`);
    console.log(`Lambda Memory: ${memorySize}MB`);

    // Your Lambda logic here...
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
