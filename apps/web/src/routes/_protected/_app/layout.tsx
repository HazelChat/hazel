import { api } from "@hazel/backend/api"
import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router"
import { NotificationManager } from "~/lib/notification-manager"

export const Route = createFileRoute("/_protected/_app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		await context.convex.awaitAuth()
		// TOOD: there is a race condition here currentl with getting the auth token in convex
		const account = await context.convex.query(api.me.get).catch(() => null)

		if (!account) {
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
