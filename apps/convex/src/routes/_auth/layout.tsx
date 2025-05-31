import { Outlet, createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_auth")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div class="flex h-screen flex-col items-center justify-center">
			<Outlet />
		</div>
	)
}
