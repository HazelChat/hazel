import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

// Generate build timestamp once and reuse it everywhere
const BUILD_TIME = Date.now()
const APP_VERSION = process.env.npm_package_version || "1.0.0"

/**
 * Plugin to generate version.json file during build
 * Used for detecting when new app versions are available
 */
function versionPlugin(): Plugin {
	return {
		name: "version-plugin",
		buildStart() {
			const version = {
				buildTime: BUILD_TIME,
				version: APP_VERSION,
			}

			// Write to public directory so it's served at /version.json
			const publicDir = resolve(__dirname, "public")
			writeFileSync(`${publicDir}/version.json`, JSON.stringify(version, null, 2))
		},
	}
}

export default defineConfig({
	plugins: [
		devtools(),
		tanstackRouter({ target: "react", autoCodeSplitting: false, routeToken: "layout" }),

		{
			...localesPlugin.vite({
				locales: ["en-US"],
			}),
			enforce: "pre",
		},

		viteReact({
			babel: {
				// plugins: ["babel-plugin-react-compiler"],
			},
		}),
		tailwindcss(),
		versionPlugin(),
	],

	define: {
		__BUILD_TIME__: BUILD_TIME,
		__APP_VERSION__: JSON.stringify(APP_VERSION),
	},

	resolve: {
		alias: {
			"~": resolve(__dirname, "./src"),
		},
	},
})
