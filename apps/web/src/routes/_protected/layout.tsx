import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router"
import { useConvexAuth } from "~/lib/convex/convex-auth-state"

import { Match, Switch, createEffect } from "solid-js"

export const Route = createFileRoute("/_protected")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const token = await context.auth.getToken()
		if (!token) {
			throw redirect({
				to: "/sign-in",
			})
		}
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
