import { createFileRoute } from "@tanstack/solid-router"
import { api } from "convex-hazel/_generated/api"
import { createEffect } from "solid-js"
import { Button } from "~/components/ui/button"
import { createMutation, createPaginatedQuery } from "~/lib/convex"
import { useConvexAuth } from "~/lib/convex/convex-auth-state"

export const Route = createFileRoute("/_app/")({
	component: RouteComponent,
})

function RouteComponent() {
	const context = Route.useRouteContext()

	const { isLoading, isAuthenticated } = useConvexAuth()

	const createUser = createMutation(api.users.createUser)

	createEffect(() => {
		console.log("isLoggedIn", context().auth.isSignedIn())
	})

	return (
		<div>
			<Button
				onClick={() => {
					console.log("creating user")
					createUser({})
				}}
			>
				Create User
			</Button>
		</div>
	)
}
