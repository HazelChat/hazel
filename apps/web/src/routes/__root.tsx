import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

export const Route = createRootRouteWithContext<{}>()({
	component: () => (
		<>
			<Outlet />
			{/* <TanStackRouterDevtools position="top-right" /> */}
		</>
	),
})
