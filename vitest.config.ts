import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		projects: ["packages/*", "apps/*"],
		coverage: {
			reporter: ["text", "json-summary", "json"],
			reportOnFailure: true,
		},
	},
})
