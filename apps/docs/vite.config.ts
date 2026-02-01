import react from "@vitejs/plugin-react"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import mdx from "fumadocs-mdx/vite"

import { nitro } from "nitro/vite"

export default defineConfig({
	server: {
		port: 3000,
	},
	ssr: {
		external: ["@takumi-rs/core", "@takumi-rs/image-response", "@takumi-rs/helpers"],
	},
	optimizeDeps: {
		exclude: ["@takumi-rs/core", "@takumi-rs/image-response", "@takumi-rs/helpers"],
	},
	plugins: [
		mdx(await import("./source.config")),
		tailwindcss(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart({
			// prerender: {
			// 	enabled: true,
			// },
		}),
		nitro(),
		react(),
	],
})
