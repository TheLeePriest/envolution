import express from "express";
import { EnvironmentConfig } from "../src";

// Initialize environment config with default schema
const env = EnvironmentConfig.getInstance();

// Get server-specific variables (these will be validated at runtime)
const getPort = () => {
	const port = process.env.PORT || "3000";
	const portNum = Number.parseInt(port, 10);
	if (Number.isNaN(portNum) || portNum <= 0) {
		throw new Error("PORT must be a positive number");
	}
	return portNum;
};

const getHost = () => process.env.HOST || "localhost";
const getApiKey = () => {
	const key = process.env.API_KEY;
	if (!key || key.length < 32) {
		throw new Error("API_KEY must be at least 32 characters");
	}
	return key;
};

// Validate all environment variables at startup
try {
	env.validateStartup();
	console.log("✅ All environment variables validated successfully");
} catch (error) {
	console.error("❌ Environment validation failed:", error);
	process.exit(1);
}

const app = express();
const port = getPort();
const host = getHost();

// Middleware to log requests with environment info
app.use((req, res, next) => {
	console.log(`[${env.stage}] ${req.method} ${req.path}`);
	next();
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "healthy",
		stage: env.stage,
		timestamp: new Date().toISOString(),
		environment: {
			isProduction: env.isProduction,
			isDevelopment: env.isDevelopment,
			logLevel: env.get("LOG_LEVEL"),
		},
	});
});

// API endpoint with environment-specific behavior
app.get("/api/data", (req, res) => {
	const apiKey = getApiKey();

	// Different behavior based on environment
	if (env.isDevelopment) {
		console.log("🔍 Development mode - returning mock data");
		res.json({ data: "mock-data", environment: "development" });
	} else {
		console.log("🚀 Production mode - processing real data");
		res.json({ data: "real-data", environment: "production" });
	}
});

app.listen(port, host, () => {
	console.log(`🚀 Server running on http://${host}:${port}`);
	console.log(`📊 Environment: ${env.stage}`);
	console.log(`🔧 Log level: ${env.get("LOG_LEVEL")}`);
	console.log(`🌍 CORS origin: ${process.env.CORS_ORIGIN || "disabled"}`);
});
