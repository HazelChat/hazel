import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/$orgSlug/notifications")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<main className="h-full w-full min-w-0 bg-bg">
			<div className="flex h-full min-h-0 w-full flex-col overflow-y-auto pt-6 pb-12">
				<Outlet />
			</div>
		</main>
	)
}
