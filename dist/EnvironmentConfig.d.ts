import { EventEmitter } from 'node:events';
import { z } from 'zod';
export interface EnvironmentConfigOptions {
    envFiles?: string[];
    validateStartup?: boolean;
    loadEnvFiles?: boolean;
    watchFiles?: boolean;
    watchInterval?: number;
    hotReload?: boolean;
}
export interface ConfigChangeEvent {
    type: 'added' | 'modified' | 'removed';
    variable: string;
    oldValue?: unknown;
    newValue?: unknown;
    timestamp: Date;
}
export declare class EnvironmentValidationError extends Error {
    readonly missingVars: string[];
    readonly invalidVars: Array<{
        name: string;
        value: string;
        expected: string;
        received: string;
    }>;
    readonly context: string | undefined;
    constructor(message: string, missingVars?: string[], invalidVars?: Array<{
        name: string;
        value: string;
        expected: string;
        received: string;
    }>, context?: string | undefined);
}
export declare class EnvironmentConfig<T extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
    private static instance;
    private config;
    private options;
    private schema;
    private watchers;
    private reloadTimer?;
    private lastConfigHash;
    private constructor();
    static getInstance<T extends Record<string, unknown>>(schema?: z.ZodSchema<T>, options?: EnvironmentConfigOptions): EnvironmentConfig<T>;
    private startWatching;
    private handleFileChange;
    private checkForChanges;
    private getConfigHash;
    private reloadConfiguration;
    private emitConfigChanges;
    stopWatching(): void;
    reload(): void;
    private loadEnvironmentFiles;
    get<K extends keyof T>(key: K): T[K];
    getRequired<K extends keyof T>(key: K, context?: string): NonNullable<T[K]>;
    getAll(): T;
    validateStartup(): void;
    get stage(): string;
    get isProduction(): boolean;
    get isDevelopment(): boolean;
    get isTest(): boolean;
    private validateEnvironment;
    static reset(): void;
}
//# sourceMappingURL=EnvironmentConfig.d.ts.map