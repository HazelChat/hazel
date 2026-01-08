import { defineConfig, devices } from "@playwright/test"
import { config } from "dotenv"

// Load test environment variables
config({ path: ".env.test" })

// Test ports (must match test-infrastructure.ts)
const TEST_BACKEND_PORT = 3003
const TEST_ELECTRIC_PROXY_PORT = 8185

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	// Global setup starts isolated PostgreSQL, Redis containers and backend
	globalSetup: "./e2e/global-setup.ts",
	globalTeardown: "./e2e/global-teardown.ts",
	// Increased timeout for container startup (3 minutes)
	globalTimeout: 180000,
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		// Setup project - runs first to authenticate
		{ name: "setup", testMatch: /.*\.setup\.ts/ },

		// Main tests - depend on setup, use saved auth state
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},
	],
	webServer: {
		// Point frontend to test backend and electric proxy (isolated containers)
		// Uses port 3000 to match backend CORS settings
		command: `VITE_BACKEND_URL=http://localhost:${TEST_BACKEND_PORT} VITE_ELECTRIC_URL=http://localhost:${TEST_ELECTRIC_PROXY_PORT}/v1/shape bunx vite --port 3000`,
		url: "http://localhost:3000",
		// Never reuse existing server - stop dev server before running e2e tests
		reuseExistingServer: false,
		// Give more time for Vite to start
		timeout: 60000,
	},
})
