import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		root: path.dirname(new URL(import.meta.url).pathname),
		include: ["src/e2e/**/*.e2e.test.ts"],
	},
})
