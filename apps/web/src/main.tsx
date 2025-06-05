import { RouterProvider, createRouter } from "@tanstack/solid-router"
import { Show, Suspense, render } from "solid-js/web"

import "solid-devtools"

import { routeTree } from "./routeTree.gen"

import "./styles/root.css"
import "./styles/code.css"
import "./styles/toast.css"

import { ClerkProvider, useAuth } from "clerk-solidjs"
import { FpsCounter } from "./components/devtools/fps-counter"
import { IconLoader } from "./components/icons/loader"
import { Logo } from "./components/logo"
import { Toaster } from "./components/ui/toaster"
import { ConvexSolidClient } from "./lib/convex"
import { ConvexProviderWithClerk } from "./lib/convex-clerk"
import { ThemeProvider, applyInitialTheme } from "./lib/theme"

applyInitialTheme()

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPreloadStaleTime: 30_000,
	context: {
		auth: undefined!,
		convex: undefined!,
	},
	defaultPendingComponent: () => (
		<div class="flex min-h-screen items-center justify-center">
			<div class="flex flex-col items-center justify-center gap-3">
				<Logo class="h-12" />
				<IconLoader class="animate-spin" />
			</div>
		</div>
	),
})

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router
	}
}

const convex = new ConvexSolidClient(import.meta.env.VITE_CONVEX_URL)

const InnerProviders = () => {
	const auth = useAuth()

	return (
		<RouterProvider
			router={router}
			context={{
				auth: auth,
				convex: convex,
			}}
		/>
	)
}

function App() {
	return (
		<ThemeProvider>
			<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
				<Suspense>
					<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
						<Toaster />
						<InnerProviders />
						<Show when={import.meta.env.DEV}>
							<FpsCounter />
						</Show>
					</ConvexProviderWithClerk>
				</Suspense>
			</ClerkProvider>
		</ThemeProvider>
	)
}

const rootElement = document.getElementById("app")
if (rootElement) {
	render(() => <App />, rootElement)
}
