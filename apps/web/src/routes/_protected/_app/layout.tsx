import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router"
import { Suspense, createEffect } from "solid-js"
import { convexQuery } from "~/lib/convex-query"
import { NotificationManager } from "~/lib/notification-manager"

export const Route = createFileRoute("/_protected/_app")({
	component: RouteComponent,
	beforeLoad: async (ctx) => {
		const accounts = await ctx.context.queryClient
			.fetchQuery(convexQuery(api.me.get, {}))
			.catch(() => null)

		if (!accounts) {
			throw redirect({
				to: "/onboarding",
				search: {
					step: "user",
				},
			})
		}
	},
})

function RouteComponent() {
	return (
		<NotificationManager>
			<Outlet />
		</NotificationManager>
	)
}
