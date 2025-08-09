import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"

import "@fontsource/inter/400.css"
import "@fontsource/inter/400-italic.css"
import "./styles/styles.css"

import { ConvexProviderWithAuthKit } from "@convex-dev/workos"
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react"
import { Toaster } from "./components/application/notifications/toaster.tsx"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { convex, convexQueryClient, queryClient } from "./db/index.ts"
import { ConvexClientProvider } from "./providers/convex-client-providers.tsx"
import reportWebVitals from "./reportWebVitals.ts"

convexQueryClient.connect(queryClient)

const router = createRouter({
	routeTree,
	context: { queryClient, convexClient: convex, convexQueryClient },
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	Wrap: ({ children }) => (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<ConvexClientProvider>
					<Toaster />
					{children}
				</ConvexClientProvider>
			</QueryClientProvider>
		</ThemeProvider>
	),
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
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
