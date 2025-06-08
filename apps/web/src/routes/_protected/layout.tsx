import { Outlet, createFileRoute } from "@tanstack/solid-router"
import { useConvexAuth } from "~/lib/convex/convex-auth-state"

import { Match, Switch, createEffect } from "solid-js"

export const Route = createFileRoute("/_protected")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		await context.convex.awaitAuth()
	},
})

function RouteComponent() {
	const navigate = Route.useNavigate()
	const { isLoading, isAuthenticated } = useConvexAuth()

	createEffect(() => {
		if (!isAuthenticated() && !isLoading()) {
			navigate({
				to: "/sign-in",
			})
		}
	})

	return (
		<Switch>
			<Match when={isLoading()}>
				<p>Loading auth...</p>
			</Match>
			<Match when={isAuthenticated()}>
				<Outlet />
			</Match>
		</Switch>
	)
}
