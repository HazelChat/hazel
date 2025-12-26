import { createRouter, type NavigateOptions, RouterProvider, type ToOptions } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { routeTree } from "./routeTree.gen.ts"

import "@fontsource/inter/400.css"
import "@fontsource/inter/400-italic.css"
import "./styles/code-syntax.css"
import "./styles/styles.css"

// Initialize app registry and mount runtimes
// Note: RPC devtools are now integrated via Effect layers in rpc-atom-client.ts
import "./lib/registry.ts"

import { PostHogProvider } from "posthog-js/react"
import { Loader } from "./components/loader.tsx"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { Toast } from "./components/ui/toast.tsx"
import reportWebVitals from "./reportWebVitals.ts"

// Load react-scan if enabled in localStorage
const reactScanEnabled = localStorage.getItem("react-scan-enabled")
if (reactScanEnabled === "true") {
	const script = document.createElement("script")
	script.crossOrigin = "anonymous"
	script.src = "//unpkg.com/react-scan/dist/auto.global.js"
	document.head.appendChild(script)
}

const _posthogOptions = {
	api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	defaults: "2025-11-30",
} as const

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
	Wrap: ({ children }) => {
		return (
			<PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={_posthogOptions}>
				<ThemeProvider>
					<Toast />
					{children}
				</ThemeProvider>
			</PostHogProvider>
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
