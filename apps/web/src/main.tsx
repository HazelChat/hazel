import { RouterProvider, createRouter } from "@tanstack/solid-router"
import { render } from "solid-js/web"

import "solid-devtools"

import { routeTree } from "./routeTree.gen"
import "./styles.css"

import "./styles/code.css"
import "./styles/toast.css"
import { QueryClientProvider } from "@tanstack/solid-query"
import { Duration, Layer, LogLevel, Logger, ManagedRuntime } from "effect"
import { Toaster } from "./components/ui/toaster"
import { ApiClient } from "./lib/services/common/api-client"
import { NetworkMonitor } from "./lib/services/common/network-monitor"
import { QueryClient } from "./lib/services/common/query-client"
import type { LiveManagedRuntime } from "./lib/services/live-layer"
import { RuntimeProvider } from "./lib/services/runtime"

import { QueryClient as TanstackQueryClient } from "@tanstack/solid-query"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPreloadStaleTime: 0,
})

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router
	}
}

const queryClient = new TanstackQueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			retryDelay: 0,
			staleTime: Duration.toMillis("5 minutes"),
			gcTime: Duration.toMillis("12 hours"),
			refetchOnWindowFocus: false,
			refetchOnReconnect: "always",
		},
		mutations: {
			retry: false,
			retryDelay: 0,
		},
	},
})

const InnerProviders = () => {
	const runtime: LiveManagedRuntime = ManagedRuntime.make(
		Layer.mergeAll(
			NetworkMonitor.Default,
			ApiClient.Default,
			QueryClient.make(queryClient),
			Logger.minimumLogLevel(import.meta.env.DEV ? LogLevel.Debug : LogLevel.Info),
		).pipe(Layer.provide(Logger.pretty)),
	)

	return (
		<QueryClientProvider client={queryClient}>
			<SolidQueryDevtools initialIsOpen={false} />
			{/* <TanStackRouterDevtools position="bottom-right" /> */}

			<RuntimeProvider runtime={runtime}>
				<RouterProvider router={router} />
			</RuntimeProvider>
		</QueryClientProvider>
	)
}

function App() {
	return (
		<>
			<Toaster />
			<InnerProviders />
		</>
	)
}

const rootElement = document.getElementById("app")
if (rootElement) {
	render(() => <App />, rootElement)
}
