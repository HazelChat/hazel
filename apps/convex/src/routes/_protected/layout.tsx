import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router"

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
	return <Outlet />
}
