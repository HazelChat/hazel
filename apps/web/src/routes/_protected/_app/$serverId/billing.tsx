import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_protected/_app/$serverId/billing")({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_protected/_app/$serverId/billing"!</div>
}
