import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations")({
	component: IntegrationsLayout,
})

function IntegrationsLayout() {
	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<Outlet />
		</div>
	)
}
