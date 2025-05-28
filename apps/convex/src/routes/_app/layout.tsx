import { Link, Outlet, createFileRoute, redirect } from "@tanstack/solid-router"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const token = await context.auth.getToken()

		console.log("called tokens")

		if (!token) {
			throw redirect({
				to: "/sign-in",
			})
		}
	},
})

function RouteComponent() {
	return (
		<div>
			<Link to="/">Home</Link>
			<Link to="/other-page">Other Page</Link>
			<Outlet />
		</div>
	)
}
