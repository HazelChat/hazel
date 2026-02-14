/**
 * @module Application entry point
 * @platform shared (with platform-specific sections)
 * @description Main entry point with Tauri initialization for desktop
 */

import { createRouter, type NavigateOptions, RouterProvider, type ToOptions } from "@tanstack/react-router"
import { HotkeysProvider } from "@tanstack/react-hotkeys"
import { StrictMode, useEffect, useState, type ReactNode } from "react"
import ReactDOM from "react-dom/client"

import { routeTree } from "./routeTree.gen.ts"

import "@fontsource/inter/400.css"
import "@fontsource/inter/400-italic.css"
import "./styles/code-syntax.css"
import "./styles/styles.css"

// Initialize app registry and mount runtimes
// Note: RPC devtools are now integrated via Effect layers in rpc-atom-client.ts
import "./lib/registry.ts"

// Initialize Tauri-specific features (no-op in browser)
import { initTauri } from "./lib/tauri.ts"

import { Loader } from "./components/loader.tsx"
import { RouteErrorComponent } from "./components/route-error.tsx"
import { RouteNotFoundComponent } from "./components/route-not-found.tsx"
import { TauriUpdateCheck } from "./components/tauri-update-check.tsx"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { Toast } from "./components/ui/toast.tsx"
import reportWebVitals from "./reportWebVitals.ts"

// Load react-scan if enabled in localStorage - defer to idle time
const reactScanEnabled = localStorage.getItem("react-scan-enabled")
if (reactScanEnabled === "true") {
	requestIdleCallback(() => {
		const script = document.createElement("script")
		script.crossOrigin = "anonymous"
		script.src = "//unpkg.com/react-scan/dist/auto.global.js"
		document.head.appendChild(script)
	})
}

const posthogOptions = {
	api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	// api_host: "https://ph.hazel.sh",

	defaults: "2025-11-30",
} as const

// Defer PostHog initialization until after hydration for faster TTI
function DeferredPostHog({ children }: { children: ReactNode }) {
	const [PostHogProvider, setProvider] = useState<React.ComponentType<{
		apiKey: string
		options: typeof posthogOptions
		children: ReactNode
	}> | null>(null)

	useEffect(() => {
		import("posthog-js/react").then((m) => setProvider(() => m.PostHogProvider))
	}, [])

	if (!PostHogProvider) return <>{children}</>
	return (
		<PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={posthogOptions}>
			{children}
		</PostHogProvider>
	)
}

export const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	defaultPendingMs: 300,
	defaultPendingMinMs: 300,
	defaultPendingComponent: Loader,
	defaultErrorComponent: RouteErrorComponent,
	defaultNotFoundComponent: RouteNotFoundComponent,
	Wrap: ({ children }) => {
		return (
			<DeferredPostHog>
				<HotkeysProvider>
					<ThemeProvider>
						<Toast />
						<TauriUpdateCheck />
						{children}
					</ThemeProvider>
				</HotkeysProvider>
			</DeferredPostHog>
		)
	},
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

declare module "react-aria-components" {
	interface RouterConfig {
		href: ToOptions
		routerOptions: Omit<NavigateOptions, keyof ToOptions>
	}
}

// Initialize Tauri and render app
// Must await initTauri to ensure tokens are synced before first API call
;(async () => {
	await initTauri()

	const rootElement = document.getElementById("app")
	if (rootElement && !rootElement.innerHTML) {
		const root = ReactDOM.createRoot(rootElement)
		root.render(
			<StrictMode>
				<RouterProvider router={router} />
			</StrictMode>,
		)
	}

	reportWebVitals()
})()
