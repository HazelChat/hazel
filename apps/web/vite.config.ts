import { resolve } from "node:path"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const host = process.env.TAURI_DEV_HOST
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM

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
			// tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	build: {
		target: process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
		rollupOptions: {
			// Only externalize Tauri plugins for web builds (not Tauri builds)
			// Tauri builds have TAURI_ENV_PLATFORM set - Tauri provides these at runtime
			external: isTauriBuild
				? [] // Tauri build: don't externalize, Tauri provides them
				: [
						// Web build: externalize all Tauri plugins, they don't exist
						"@tauri-apps/plugin-autostart",
						"@tauri-apps/plugin-deep-link",
						"@tauri-apps/plugin-notification",
						"@tauri-apps/plugin-opener",
						"@tauri-apps/plugin-process",
						"@tauri-apps/plugin-updater",
						"@tauri-apps/plugin-window-state",
					],
		},
	},
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
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		tailwindcss(),
		// Only enable PWA for web builds (not Tauri - it has its own update mechanism)
		...(isTauriBuild
			? []
			: [
					VitePWA({
						registerType: "prompt",
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
