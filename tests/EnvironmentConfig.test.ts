import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EnvironmentConfig } from '../src';

describe('EnvironmentConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };
    // Reset singleton instance before each test
    EnvironmentConfig.reset();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Reset singleton instance after each test
    EnvironmentConfig.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = EnvironmentConfig.getInstance();
      const instance2 = EnvironmentConfig.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance correctly', () => {
      const instance1 = EnvironmentConfig.getInstance();
      EnvironmentConfig.reset();
      const instance2 = EnvironmentConfig.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Basic Functionality', () => {
    it('should get environment variables', () => {
      process.env.TEST_VAR = 'test_value';
      const env = EnvironmentConfig.getInstance();
      expect(env.get('TEST_VAR')).toBe('test_value');
    });

    it('should get all environment variables', () => {
      process.env.VAR1 = 'value1';
      process.env.VAR2 = 'value2';
      const env = EnvironmentConfig.getInstance();
      const allConfig = env.getAll();
      expect(allConfig.VAR1).toBe('value1');
      expect(allConfig.VAR2).toBe('value2');
    });

    it('should return undefined for non-existent variables', () => {
      const env = EnvironmentConfig.getInstance();
      expect(env.get('NON_EXISTENT_VAR')).toBeUndefined();
    });
  });

  describe('Required Values', () => {
    it('should get required values successfully', () => {
      process.env.REQUIRED_VAR = 'required_value';
      const env = EnvironmentConfig.getInstance();
      expect(env.getRequired('REQUIRED_VAR', 'TestService')).toBe('required_value');
    });

    it('should throw error for missing required values', () => {
      const env = EnvironmentConfig.getInstance();
      expect(() => {
        env.getRequired('MISSING_VAR', 'TestService');
      }).toThrow('MISSING_VAR environment variable is required for TestService');
    });

    it('should throw error for null required values', () => {
      // @ts-ignore - Testing null value
      process.env.NULL_VAR = null;
      const env = EnvironmentConfig.getInstance();
      expect(() => {
        env.getRequired('NULL_VAR', 'TestService');
      }).toThrow('NULL_VAR environment variable is required for TestService');
    });

    it('should throw error without context for missing required values', () => {
      const env = EnvironmentConfig.getInstance();
      expect(() => {
        env.getRequired('MISSING_VAR');
      }).toThrow('MISSING_VAR environment variable is required');
    });
  });

  describe('Stage Getters', () => {
    it('should return correct stage', () => {
      process.env.STAGE = 'prod';
      const env = EnvironmentConfig.getInstance();
      expect(env.stage).toBe('prod');
    });

    it('should default to dev when STAGE is not set', () => {
      process.env.STAGE = undefined as unknown as string;
      const env = EnvironmentConfig.getInstance();
      expect(env.stage).toBe('dev');
    });

    it('should return correct isProduction flag', () => {
      process.env.STAGE = 'prod';
      const env = EnvironmentConfig.getInstance();
      expect(env.isProduction).toBe(true);
    });

    it('should return false for isProduction when not in prod', () => {
      process.env.STAGE = 'dev';
      const env = EnvironmentConfig.getInstance();
      expect(env.isProduction).toBe(false);
    });

    it('should return correct isDevelopment flag', () => {
      process.env.STAGE = 'dev';
      const env = EnvironmentConfig.getInstance();
      expect(env.isDevelopment).toBe(true);
    });

    it('should return false for isDevelopment when not in dev', () => {
      process.env.STAGE = 'prod';
      const env = EnvironmentConfig.getInstance();
      expect(env.isDevelopment).toBe(false);
    });

    it('should return correct isTest flag', () => {
      process.env.STAGE = 'test';
      const env = EnvironmentConfig.getInstance();
      expect(env.isTest).toBe(true);
    });

    it('should return false for isTest when not in test', () => {
      process.env.STAGE = 'dev';
      const env = EnvironmentConfig.getInstance();
      expect(env.isTest).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      const env = EnvironmentConfig.getInstance();
      expect(env.get('NON_EXISTENT_VAR')).toBeUndefined();
    });
  });
});
