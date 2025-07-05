import { createEnvironmentConfig, BaseEnvironmentSchema } from "../src";
import { z } from "zod";

// Define a schema for our application
const AppSchema = z.object({
	PORT: z
		.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default("3000"),
	DATABASE_URL: z.string().url(),
	API_KEY: z.string().min(32),
	DEBUG_MODE: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default("false"),
});

// Initialize with hot-reloading enabled
const env = createEnvironmentConfig(AppSchema, {
	hotReload: true,
	watchFiles: true,
	watchInterval: 2000, // Check every 2 seconds
	validateStartup: true,
});

console.log("🚀 Application started with hot-reloading enabled");
console.log(`📊 Current configuration:`);
console.log(`   Port: ${env.get("PORT")}`);
console.log(`   Debug Mode: ${env.get("DEBUG_MODE")}`);
console.log(`   Database URL: ${env.get("DATABASE_URL")}`);

// Listen for configuration changes
env.on("configChanged", (change) => {
	console.log(`🔄 Configuration changed:`);
	console.log(`   Variable: ${change.variable}`);
	console.log(`   Type: ${change.type}`);
	console.log(`   Old Value: ${change.oldValue}`);
	console.log(`   New Value: ${change.newValue}`);
	console.log(`   Timestamp: ${change.timestamp.toISOString()}`);
});

// Listen for specific variable changes
env.on("configChanged:DEBUG_MODE", (change) => {
	console.log(`🐛 Debug mode changed to: ${change.newValue}`);
	if (change.newValue === true) {
		console.log("🔍 Debug logging enabled");
	} else {
		console.log("🔇 Debug logging disabled");
	}
});

env.on("configChanged:PORT", (change) => {
	console.log(`🌐 Port changed from ${change.oldValue} to ${change.newValue}`);
	console.log(
		"⚠️  You may need to restart the server for port changes to take effect",
	);
});

// Listen for configuration reload events
env.on("configReloaded", (event) => {
	console.log("✅ Configuration reloaded successfully");
	console.log(`📊 Reloaded at: ${event.timestamp.toISOString()}`);
});

// Listen for reload errors
env.on("configReloadError", (error) => {
	console.error("❌ Failed to reload configuration:", error);
});

// Example: Manual reload
setTimeout(() => {
	console.log("🔄 Manually triggering configuration reload...");
	env.reload();
}, 10000);

// Example: Stop watching (useful for cleanup)
process.on("SIGINT", () => {
	console.log("🛑 Stopping configuration watchers...");
	env.stopWatching();
	process.exit(0);
});

console.log("\n📝 To test hot-reloading:");
console.log("1. Create a .env file in your project root");
console.log("2. Add some configuration variables");
console.log("3. Modify the .env file and watch the changes");
console.log("4. Press Ctrl+C to stop");

// Keep the process running
setInterval(() => {
	console.log(`⏰ Current time: ${new Date().toISOString()}`);
	console.log(`🔧 Current debug mode: ${env.get("DEBUG_MODE")}`);
}, 30000);
