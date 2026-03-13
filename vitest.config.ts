import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		projects: ["packages/*", "apps/*", "libs/*", "!apps/bot-gateway"],
		coverage: {
			reporter: ["text", "json-summary", "json"],
			reportOnFailure: true,
		},
	},
})
