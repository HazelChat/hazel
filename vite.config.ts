import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
// vite.config.ts
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ target: "solid", autoCodeSplitting: true }),
		solid(),
		// ...,
	],
})
