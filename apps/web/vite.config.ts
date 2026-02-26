import { resolve } from "node:path"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const host = process.env.ELECTROBUN_DEV_HOST
const isDesktopBuild = process.env.ELECTROBUN_BUILD === "1"
const desktopOs = process.env.ELECTROBUN_OS
const isDebugDesktopBuild = process.env.ELECTROBUN_BUILD_ENV === "dev"

const appVersion = process.env.APP_VERSION ?? "0.1.7"

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
	},
	envPrefix: ["VITE_", "ELECTROBUN_"],
	define: {
		__APP_VERSION__: JSON.stringify(appVersion),
		"import.meta.env.VITE_COMMIT_SHA": JSON.stringify(commitSha),
	},
	build: {
		target: desktopOs === "win" ? "chrome105" : "safari13",
		minify: !isDebugDesktopBuild ? "esbuild" : false,
		sourcemap: isDebugDesktopBuild,
		rollupOptions: {
			external: isDesktopBuild ? [] : ["electrobun/view"],
			output: {
				manualChunks: {
					"vendor-react": ["react", "react-dom"],
					"vendor-effect": [
						"effect",
						"@effect/platform",
						"@effect/platform-browser",
						"@effect/rpc",
						"@effect/experimental",
					],
					"vendor-react-aria": ["react-aria", "react-aria-components", "react-stately"],
					"vendor-slate": ["slate", "slate-react", "slate-history", "prismjs"],
					"vendor-tanstack": [
						"@tanstack/react-query",
						"@tanstack/react-router",
						"@tanstack/react-form",
						"@tanstack/react-db",
						"@tanstack/db",
					],
				},
			},
		},
	},
	plugins: [
		...(isDesktopBuild
			? [
					{
						name: "mock-pwa-for-desktop",
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

		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		tailwindcss(),
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
		...(isDesktopBuild
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
							mode: "development",
							globPatterns: ["**/*.{js,css,html,svg,ico,woff2}"],
							globIgnores: ["**/images/onboarding/**"],
							maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
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
