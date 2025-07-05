import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "node:path";
import { watch } from "node:fs";
import { EventEmitter } from "node:events";
export class EnvironmentValidationError extends Error {
	constructor(
		message,
		missingVars = [],
		invalidVars = [],
		context = undefined,
	) {
		super(message);
		this.name = "EnvironmentValidationError";
		this.missingVars = missingVars;
		this.invalidVars = invalidVars;
		this.context = context;
	}
}
export class EnvironmentConfig extends EventEmitter {
	constructor(schema, options = {}) {
		super();
		this.watchers = [];
		this.lastConfigHash = "";
		this.schema = schema;
		this.options = {
			loadEnvFiles: true,
			validateStartup: false,
			envFiles: [".env", ".env.local"],
			watchFiles: false,
			watchInterval: 5000,
			hotReload: false,
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
	static getInstance(schema, options) {
		if (!EnvironmentConfig.instance) {
			EnvironmentConfig.instance = new EnvironmentConfig(schema, options);
		}
		return EnvironmentConfig.instance;
	}
	startWatching() {
		if (!this.options.envFiles) return;
		for (const envFile of this.options.envFiles) {
			const filePath = resolve(process.cwd(), envFile);
			try {
				const watcher = watch(filePath, (eventType) => {
					if (eventType === "change") {
						this.handleFileChange(envFile);
					}
				});
				this.watchers.push({ path: filePath, watcher });
			} catch (error) {
				console.warn(`Warning: Could not watch ${envFile}: ${error}`);
			}
		}
		if (this.options.watchInterval && this.options.watchInterval > 0) {
			this.reloadTimer = setInterval(() => {
				this.checkForChanges();
			}, this.options.watchInterval);
		}
	}
	handleFileChange(filePath) {
		console.log(`🔄 Configuration file changed: ${filePath}`);
		this.reloadConfiguration();
	}
	checkForChanges() {
		const currentHash = this.getConfigHash();
		if (currentHash !== this.lastConfigHash) {
			console.log("🔄 Configuration change detected");
			this.reloadConfiguration();
		}
	}
	getConfigHash() {
		return JSON.stringify(this.config);
	}
	reloadConfiguration() {
		const oldConfig = { ...this.config };
		try {
			this.loadEnvironmentFiles();
			this.config = this.validateEnvironment(this.schema);
			this.lastConfigHash = this.getConfigHash();
			this.emitConfigChanges(oldConfig, this.config);
			console.log("✅ Configuration reloaded successfully");
		} catch (error) {
			console.error("❌ Failed to reload configuration:", error);
			this.emit("configReloadError", error);
		}
	}
	emitConfigChanges(oldConfig, newConfig) {
		const allKeys = new Set([
			...Object.keys(oldConfig),
			...Object.keys(newConfig),
		]);
		for (const key of allKeys) {
			const oldValue = oldConfig[key];
			const newValue = newConfig[key];
			if (oldValue !== newValue) {
				const changeEvent = {
					type:
						oldValue === undefined
							? "added"
							: newValue === undefined
								? "removed"
								: "modified",
					variable: key,
					oldValue,
					newValue,
					timestamp: new Date(),
				};
				this.emit("configChanged", changeEvent);
				this.emit(`configChanged:${key}`, changeEvent);
			}
		}
		this.emit("configReloaded", {
			oldConfig,
			newConfig,
			timestamp: new Date(),
		});
	}
	stopWatching() {
		for (const { watcher } of this.watchers) {
			watcher.close();
		}
		this.watchers = [];
		if (this.reloadTimer) {
			clearInterval(this.reloadTimer);
			this.reloadTimer = undefined;
		}
	}
	reload() {
		this.reloadConfiguration();
	}
	loadEnvironmentFiles() {
		if (!this.options.loadEnvFiles || !this.options.envFiles) {
			return;
		}
		for (const envFile of this.options.envFiles) {
			try {
				const result = config({ path: resolve(process.cwd(), envFile) });
				if (result.error) {
					console.warn(
						`Warning: Could not load ${envFile}: ${result.error.message}`,
					);
				}
			} catch (error) {
				if (error instanceof Error && error.message.includes("ENOENT")) {
					continue;
				}
				console.warn(`Warning: Error loading ${envFile}: ${error}`);
			}
		}
	}
	get(key) {
		return this.config[key];
	}
	getRequired(key, context) {
		const value = this.config[key];
		if (value === undefined || value === null) {
			const contextMsg = context ? ` for ${context}` : "";
			throw new EnvironmentValidationError(
				`${String(key)} environment variable is required${contextMsg}`,
				[String(key)],
				[],
				context,
			);
		}
		return value;
	}
	getAll() {
		return { ...this.config };
	}
	validateStartup() {
		if (!this.schema) {
			return;
		}
		try {
			this.schema.parse(process.env);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const missingVars = [];
				const invalidVars = [];
				for (const err of error.errors) {
					const varName = err.path.join(".");
					const value = process.env[varName] || "undefined";
					if (err.code === "invalid_type" && err.received === "undefined") {
						missingVars.push(varName);
					} else {
						invalidVars.push({
							name: varName,
							value,
							expected: "valid value",
							received: err.message || "invalid value",
						});
					}
				}
				const missingMsg =
					missingVars.length > 0
						? `\nMissing required variables: ${missingVars.join(", ")}`
						: "";
				const invalidMsg =
					invalidVars.length > 0
						? `\nInvalid variables: ${invalidVars
								.map(
									(v) => `${v.name} (expected ${v.expected}, got '${v.value}')`,
								)
								.join(", ")}`
						: "";
				throw new EnvironmentValidationError(
					`Environment validation failed at startup.${missingMsg}${invalidMsg}`,
					missingVars,
					invalidVars,
				);
			}
			throw error;
		}
	}
	get stage() {
		const stageValue = this.config.STAGE;
		return typeof stageValue === "string" ? stageValue : "dev";
	}
	get isProduction() {
		return this.stage === "prod";
	}
	get isDevelopment() {
		return this.stage === "dev";
	}
	get isTest() {
		return this.stage === "test";
	}
	validateEnvironment(schema) {
		try {
			if (schema) {
				return schema.parse(process.env);
			}
			return process.env;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const missingVars = [];
				const invalidVars = [];
				for (const err of error.errors) {
					const varName = err.path.join(".");
					const value = process.env[varName] || "undefined";
					if (err.code === "invalid_type" && err.received === "undefined") {
						missingVars.push(varName);
					} else {
						invalidVars.push({
							name: varName,
							value,
							expected: "valid value",
							received: err.message || "invalid value",
						});
					}
				}
				const missingMsg =
					missingVars.length > 0
						? `\nMissing required variables: ${missingVars.join(", ")}`
						: "";
				const invalidMsg =
					invalidVars.length > 0
						? `\nInvalid variables: ${invalidVars
								.map(
									(v) => `${v.name} (expected ${v.expected}, got '${v.value}')`,
								)
								.join(", ")}`
						: "";
				throw new EnvironmentValidationError(
					`Environment validation failed.${missingMsg}${invalidMsg}`,
					missingVars,
					invalidVars,
				);
			}
			throw error;
		}
	}
	static reset() {
		if (EnvironmentConfig.instance) {
			EnvironmentConfig.instance.stopWatching();
		}
		EnvironmentConfig.instance = undefined;
	}
}
//# sourceMappingURL=EnvironmentConfig.js.map
