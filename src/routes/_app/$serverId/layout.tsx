import { Outlet, createFileRoute, useNavigate } from "@tanstack/solid-router"
import { Show, createEffect } from "solid-js"
import { useCurrentUser } from "~/lib/hooks/data/use-current-user"

export const Route = createFileRoute("/_app/$serverId")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user, isLoading } = useCurrentUser()

	const navigate = useNavigate()

	if (isLoading()) {
		return <p>Loading...</p>
	}

	createEffect(() => {
		if (!isLoading()) {
			if (!user()) {
				navigate({ to: "/onboarding", replace: true })
			}
		}
	})

	return (
		<Show when={!isLoading()} fallback={<p>Loading...</p>}>
			<Show when={user()}>
				<Outlet />
			</Show>
		</Show>
	)
}
