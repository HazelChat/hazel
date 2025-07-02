import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { createFileRoute, Outlet } from "@tanstack/solid-router"
import { createEffect, Match, Switch } from "solid-js"
import { IconSpinnerStroke } from "~/components/iconsv2"
import { Logo } from "~/components/logo"
import { useConvexAuth } from "~/lib/convex/convex-auth-state"
import { convexQuery } from "~/lib/convex-query"
import { NotificationManager } from "~/lib/notification-manager"

export const Route = createFileRoute("/_protected/_app")({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = Route.useNavigate()

	const { isLoading, isAuthenticated } = useConvexAuth()

	const accountsQuery = useQuery(() => convexQuery(api.me.get, isAuthenticated() ? {} : "skip"))

	createEffect(() => {
		if (accountsQuery.isPending) {
			return
		}

		if (accountsQuery.isError || !accountsQuery.data) {
			navigate({
				to: "/onboarding",
				search: {
					step: "user",
					redirectTo: window.location.pathname.includes("invite")
						? window.location.pathname
						: undefined,
				},
				replace: true,
			})
		}
	})

	return (
		<Switch>
			<Match when={isLoading() || accountsQuery.status === "pending" || !accountsQuery.data}>
				<div class="flex min-h-screen items-center justify-center">
					<div class="flex flex-col items-center justify-center gap-3">
						<Logo class="h-12" />
						<IconSpinnerStroke class="animate-spin" />
						<p>Loading your account...</p>
					</div>
				</div>
			</Match>
			<Match when={true}>
				<NotificationManager>
					<Outlet />
				</NotificationManager>
			</Match>
		</Switch>
	)
}
