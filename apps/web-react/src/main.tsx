import { createRouter, RouterProvider } from "@tanstack/react-router"
import { AuthKitProvider } from "@workos-inc/authkit-react"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import reportWebVitals from "./reportWebVitals.ts"
import { routeTree } from "./routeTree.gen"
import "@/styles/globals.css"

const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
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
			<AuthKitProvider
				clientId={import.meta.env.VITE_WORKOS_CLIENT_ID || "client_01HGZR2CV5G9VPBYK6XFA8YG17"}
				onRedirectCallback={({ state }) => {
					if (state?.returnTo) {
						window.location.href = state.returnTo
					}
				}}
			>
				<RouterProvider router={router} />
			</AuthKitProvider>
		</StrictMode>,
	)
}

reportWebVitals()
