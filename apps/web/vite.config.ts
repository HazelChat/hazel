import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const host = process.env.TAURI_DEV_HOST
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM

// Read app version from desktop tauri.conf.json (single source of truth)
const tauriConfig = JSON.parse(
	readFileSync(resolve(__dirname, "../desktop/src-tauri/tauri.conf.json"), "utf-8"),
)
const appVersion = tauriConfig.version

// Resolve git commit SHA from environment (Railway) or git
const commitSha =
	process.env.RAILWAY_GIT_COMMIT_SHA ??
	process.env.COMMIT_SHA ??
	process.env.WORKERS_CI_COMMIT_SHA ??
	"unknown"

export default defineConfig({
	server: {
		port: 3000,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// Ignore native shell sources (owned by apps/desktop)
			ignored: ["**/src-tauri/**", "../desktop/src-tauri/**"],
		},
	},
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	define: {
		__APP_VERSION__: JSON.stringify(appVersion),
		"import.meta.env.VITE_COMMIT_SHA": JSON.stringify(commitSha),
	},
	build: {
		target: process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
		rollupOptions: {
			// Web build: externalize all Tauri packages, they don't exist
			external: isTauriBuild
				? []
				: [
						// Core Tauri API
						"@tauri-apps/api/core",
						"@tauri-apps/api/event",
						// Tauri plugins
						"@tauri-apps/plugin-autostart",
						"@tauri-apps/plugin-deep-link",
						"@tauri-apps/plugin-notification",
						"@tauri-apps/plugin-opener",
						"@tauri-apps/plugin-process",
						"@tauri-apps/plugin-store",
						"@tauri-apps/plugin-updater",
						"@tauri-apps/plugin-window-state",
					],
			output: {
				manualChunks(id: string) {
					if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
						return "vendor-react"
					}
					if (
						id.includes("node_modules/effect/") ||
						id.includes("node_modules/@effect/platform") ||
						id.includes("node_modules/@effect/rpc") ||
						id.includes("node_modules/@effect/experimental")
					) {
						return "vendor-effect"
					}
					if (
						id.includes("node_modules/react-aria/") ||
						id.includes("node_modules/react-aria-components/") ||
						id.includes("node_modules/react-stately/")
					) {
						return "vendor-react-aria"
					}
					if (
						id.includes("node_modules/slate/") ||
						id.includes("node_modules/slate-react/") ||
						id.includes("node_modules/slate-history/") ||
						id.includes("node_modules/prismjs/")
					) {
						return "vendor-slate"
					}
					if (
						id.includes("node_modules/@tanstack/react-query/") ||
						id.includes("node_modules/@tanstack/react-router/") ||
						id.includes("node_modules/@tanstack/react-form/") ||
						id.includes("node_modules/@tanstack/react-db/") ||
						id.includes("node_modules/@tanstack/db/")
					) {
						return "vendor-tanstack"
					}
				},
			},
		},
	},
	plugins: [
		// For Tauri builds, provide a no-op mock for PWA virtual module
		...(isTauriBuild
			? [
					{
						name: "mock-pwa-for-tauri",
						resolveId(id: string) {
							if (id === "virtual:pwa-register/react") {
								return "\0virtual:pwa-noop"
							}
						},
						load(id: string) {
							if (id === "\0virtual:pwa-noop") {
								return "export const useRegisterSW = () => ({ needRefresh: [false], updateServiceWorker: () => {} })"
							}
						},
					},
				]
			: []),
		devtools(),
		tanstackRouter({ target: "react", autoCodeSplitting: false, routeToken: "layout" }),

		{
			...localesPlugin.vite({
				locales: ["en-US"],
			}),
			enforce: "pre",
		},

		viteReact(),
		babel({
			presets: [reactCompilerPreset()],
		}),
		tailwindcss(),
		// Bundle visualizer - run with ANALYZE=true bun run build
		...(process.env.ANALYZE
			? [
					visualizer({
						filename: "stats.html",
						open: false,
						gzipSize: true,
						brotliSize: true,
					}),
				]
			: []),
		// Only enable PWA for web builds (not Tauri - it has its own update mechanism)
		...(isTauriBuild
			? []
			: [
					VitePWA({
						registerType: "autoUpdate",
						includeAssets: ["icon.svg", "favicon.ico"],
						manifest: {
							name: "Hazel Chat",
							short_name: "Hazel",
							description: "Slack alternative for modern teams.",
							theme_color: "#000000",
							background_color: "#ffffff",
							display: "standalone",
							start_url: "/",
							icons: [
								{
									src: "pwa-64x64.png",
									sizes: "64x64",
									type: "image/png",
								},
								{
									src: "pwa-192x192.png",
									sizes: "192x192",
									type: "image/png",
								},
								{
									src: "pwa-512x512.png",
									sizes: "512x512",
									type: "image/png",
								},
								{
									src: "maskable-icon-512x512.png",
									sizes: "512x512",
									type: "image/png",
									purpose: "maskable",
								},
							],
						},
						workbox: {
							// Workbox uses Rollup + Terser when mode="production". Under Bun this can
							// intermittently fail with "Unexpected early exit" in the terser renderChunk hook.
							// Running in development mode avoids Terser while still generating a valid SW.
							mode: "development",
							globPatterns: ["**/*.{js,css,html,svg,ico,woff2}"],
							globIgnores: ["**/images/onboarding/**"],
							maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
						},
					}),
				]),
	],

	resolve: {
		alias: {
			"~": resolve(__dirname, "./src"),
		},
	},
})
