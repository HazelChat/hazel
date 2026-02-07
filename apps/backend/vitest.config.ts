import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	resolve: {
		alias: {
			bun: path.resolve(import.meta.dirname, "../../test/stubs/bun.ts"),
		},
	},
})
