import { EventEmitter } from 'node:events';
import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

/**
 * Configuration options for EnvironmentConfig
 */
export interface EnvironmentConfigOptions {
  /** Environment files to load (e.g., ['.env', '.env.local']) */
  envFiles?: string[];
  /** Whether to validate all required config at startup */
  validateStartup?: boolean;
  /** Whether to load environment files automatically */
  loadEnvFiles?: boolean;
  /** Whether to watch for file changes and hot-reload */
  watchFiles?: boolean;
  /** Interval in milliseconds to check for file changes (default: 5000) */
  watchInterval?: number;
  /** Whether to enable hot-reloading */
  hotReload?: boolean;
  /** Whether to suppress warning logs for missing/invalid env files */
  suppressWarnings?: boolean;
}

/**
 * Configuration change event data
 */
export interface ConfigChangeEvent {
  /** Type of change */
  type: 'added' | 'modified' | 'removed';
  /** Name of the changed variable */
  variable: string;
  /** Old value (if available) */
  oldValue?: unknown;
  /** New value (if available) */
  newValue?: unknown;
  /** Timestamp of the change */
  timestamp: Date;
}

/**
 * Enhanced error with detailed validation information
 */
export class EnvironmentValidationError extends Error {
  public readonly missingVars: string[];
  public readonly invalidVars: Array<{
    name: string;
    value: string;
    expected: string;
    received: string;
  }>;
  public readonly context: string | undefined;

  constructor(
    message: string,
    missingVars: string[] = [],
    invalidVars: Array<{
      name: string;
      value: string;
      expected: string;
      received: string;
    }> = [],
    context: string | undefined = undefined
  ) {
    super(message);
    this.name = 'EnvironmentValidationError';
    this.missingVars = missingVars;
    this.invalidVars = invalidVars;
    this.context = context;
  }
}

/**
 * Generic environment configuration class with Zod validation
 */
export class EnvironmentConfig<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends EventEmitter {
  private static instance: EnvironmentConfig;
  private config: T;
  private options: EnvironmentConfigOptions;
  private schema: z.ZodSchema<T> | undefined;
  private watchers: Array<{ path: string; watcher: ReturnType<typeof watch> }> = [];
  private reloadTimer?: NodeJS.Timeout;
  private lastConfigHash = '';

  private constructor(schema?: z.ZodSchema<T>, options: EnvironmentConfigOptions = {}) {
    super();
    this.schema = schema;
    this.options = {
      loadEnvFiles: true,
      validateStartup: false,
      envFiles: ['.env', '.env.local'],
      watchFiles: false,
      watchInterval: 5000,
      hotReload: false,
      suppressWarnings: false,
      ...options,
    };

    this.loadEnvironmentFiles();
    this.config = this.validateEnvironment(schema);
    this.lastConfigHash = this.getConfigHash();

    if (this.options.validateStartup) {
      this.validateStartup();
    }

    if (this.options.hotReload || this.options.watchFiles) {
      this.startWatching();
    }
  }

  /**
   * Get singleton instance of EnvironmentConfig
   */
  public static getInstance<T extends Record<string, unknown>>(
    schema?: z.ZodSchema<T>,
    options?: EnvironmentConfigOptions
  ): EnvironmentConfig<T> {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig(schema, options);
    }
    return EnvironmentConfig.instance as EnvironmentConfig<T>;
  }

  /**
   * Start watching for file changes
   */
  private startWatching(): void {
    if (!this.options.envFiles) return;

    // Watch individual files
    for (const envFile of this.options.envFiles) {
      const filePath = resolve(process.cwd(), envFile);
      try {
        const watcher = watch(filePath, (eventType) => {
          if (eventType === 'change') {
            this.handleFileChange(envFile);
          }
        });
        this.watchers.push({ path: filePath, watcher });
      } catch (error) {
        // File might not exist yet, that's okay
        if (!this.options.suppressWarnings) {
          console.warn(`Warning: Could not watch ${envFile}: ${error}`);
        }
      }
    }

    // Set up polling as backup
    if (this.options.watchInterval && this.options.watchInterval > 0) {
      this.reloadTimer = setInterval(() => {
        this.checkForChanges();
      }, this.options.watchInterval);
    }
  }

  /**
   * Handle file change events
   */
  private handleFileChange(filePath: string): void {
    console.log(`🔄 Configuration file changed: ${filePath}`);
    this.reloadConfiguration();
  }

  /**
   * Check for configuration changes
   */
  private checkForChanges(): void {
    const currentHash = this.getConfigHash();
    if (currentHash !== this.lastConfigHash) {
      console.log('🔄 Configuration change detected');
      this.reloadConfiguration();
    }
  }

  /**
   * Get hash of current configuration for change detection
   */
  private getConfigHash(): string {
    return JSON.stringify(this.config);
  }

  /**
   * Reload configuration from files
   */
  private reloadConfiguration(): void {
    const oldConfig = { ...this.config };

    try {
      // Reload environment files
      this.loadEnvironmentFiles();

      // Re-validate with schema
      this.config = this.validateEnvironment(this.schema);
      this.lastConfigHash = this.getConfigHash();

      // Emit change events
      this.emitConfigChanges(oldConfig, this.config);

      console.log('✅ Configuration reloaded successfully');
    } catch (error) {
      console.error('❌ Failed to reload configuration:', error);
      this.emit('configReloadError', error);
    }
  }

  /**
   * Emit configuration change events
   */
  private emitConfigChanges(oldConfig: T, newConfig: T): void {
    const allKeys = new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)]);

    for (const key of allKeys) {
      const oldValue = oldConfig[key as keyof T];
      const newValue = newConfig[key as keyof T];

      if (oldValue !== newValue) {
        const changeEvent: ConfigChangeEvent = {
          type: oldValue === undefined ? 'added' : newValue === undefined ? 'removed' : 'modified',
          variable: key,
          oldValue,
          newValue,
          timestamp: new Date(),
        };

        this.emit('configChanged', changeEvent);
        this.emit(`configChanged:${key}`, changeEvent);
      }
    }

    this.emit('configReloaded', {
      oldConfig,
      newConfig,
      timestamp: new Date(),
    });
  }

  /**
   * Stop watching for file changes
   */
  public stopWatching(): void {
    // Stop file watchers
    for (const { watcher } of this.watchers) {
      watcher.close();
    }
    this.watchers = [];

    // Stop polling timer
    if (this.reloadTimer) {
      clearInterval(this.reloadTimer);
      this.reloadTimer = undefined as unknown as NodeJS.Timeout;
    }
  }

  /**
   * Manually trigger configuration reload
   */
  public reload(): void {
    this.reloadConfiguration();
  }

  /**
   * Load environment files
   */
  private loadEnvironmentFiles(): void {
    if (!this.options.loadEnvFiles || !this.options.envFiles) {
      return;
    }

    for (const envFile of this.options.envFiles) {
      try {
        const result = config({ path: resolve(process.cwd(), envFile) });
        if (result.error && !this.options.suppressWarnings) {
          console.warn(`Warning: Could not load ${envFile}: ${result.error.message}`);
        }
      } catch (error) {
        // Silently ignore missing .env files
        if (error instanceof Error && error.message.includes('ENOENT')) {
          continue;
        }
        if (!this.options.suppressWarnings) {
          console.warn(`Warning: Error loading ${envFile}: ${error}`);
        }
      }
    }
  }

  /**
   * Get a configuration value
   */
  public get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }

  /**
   * Get a required configuration value (throws if undefined/null)
   */
  public getRequired<K extends keyof T>(key: K, context?: string): NonNullable<T[K]> {
    const value = this.config[key];
    if (value === undefined || value === null) {
      const contextMsg = context ? ` for ${context}` : '';
      throw new EnvironmentValidationError(
        `${String(key)} environment variable is required${contextMsg}`,
        [String(key)],
        [],
        context
      );
    }
    return value as NonNullable<T[K]>;
  }

  /**
   * Get all configuration values
   */
  public getAll(): T {
    return { ...this.config };
  }

  /**
   * Validate all required configuration at startup
   */
  public validateStartup(): void {
    if (!this.schema) {
      return; // No schema means no validation
    }

    try {
      this.schema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars: string[] = [];
        const invalidVars: Array<{
          name: string;
          value: string;
          expected: string;
          received: string;
        }> = [];

        for (const err of error.errors) {
          const varName = err.path.join('.');
          const value = process.env[varName] || 'undefined';

          if (err.code === 'invalid_type' && err.received === 'undefined') {
            missingVars.push(varName);
          } else {
            invalidVars.push({
              name: varName,
              value,
              expected: 'valid value',
              received: err.message || 'invalid value',
            });
          }
        }

        const missingMsg =
          missingVars.length > 0 ? `\nMissing required variables: ${missingVars.join(', ')}` : '';

        const invalidMsg =
          invalidVars.length > 0
            ? `\nInvalid variables: ${invalidVars
                .map((v) => `${v.name} (expected ${v.expected}, got '${v.value}')`)
                .join(', ')}`
            : '';

        throw new EnvironmentValidationError(
          `Environment validation failed at startup.${missingMsg}${invalidMsg}`,
          missingVars,
          invalidVars
        );
      }
      throw error;
    }
  }

  /**
   * Get the current stage
   */
  public get stage(): string {
    const stageValue = (this.config as { STAGE?: string }).STAGE;
    return typeof stageValue === 'string' ? stageValue : 'dev';
  }

  /**
   * Check if running in production
   */
  public get isProduction(): boolean {
    return this.stage === 'prod';
  }

  /**
   * Check if running in development
   */
  public get isDevelopment(): boolean {
    return this.stage === 'dev';
  }

  /**
   * Check if running in test environment
   */
  public get isTest(): boolean {
    return this.stage === 'test';
  }

  /**
   * Validate environment variables against schema
   */
  private validateEnvironment(schema?: z.ZodSchema<T>): T {
    try {
      if (schema) {
        return schema.parse(process.env);
      }

      // Default validation - just return process.env as-is
      return process.env as T;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars: string[] = [];
        const invalidVars: Array<{
          name: string;
          value: string;
          expected: string;
          received: string;
        }> = [];

        for (const err of error.errors) {
          const varName = err.path.join('.');
          const value = process.env[varName] || 'undefined';

          if (err.code === 'invalid_type' && err.received === 'undefined') {
            missingVars.push(varName);
          } else {
            invalidVars.push({
              name: varName,
              value,
              expected: 'valid value',
              received: err.message || 'invalid value',
            });
          }
        }

        const missingMsg =
          missingVars.length > 0 ? `\nMissing required variables: ${missingVars.join(', ')}` : '';

        const invalidMsg =
          invalidVars.length > 0
            ? `\nInvalid variables: ${invalidVars
                .map((v) => `${v.name} (expected ${v.expected}, got '${v.value}')`)
                .join(', ')}`
            : '';

        throw new EnvironmentValidationError(
          `Environment validation failed.${missingMsg}${invalidMsg}`,
          missingVars,
          invalidVars
        );
      }
      throw error;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    if (EnvironmentConfig.instance) {
      EnvironmentConfig.instance.stopWatching();
    }
    EnvironmentConfig.instance = undefined as unknown as EnvironmentConfig;
  }
}
