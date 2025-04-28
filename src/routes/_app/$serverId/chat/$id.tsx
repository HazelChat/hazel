import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/_app/$serverId/chat/$id")({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_app/$serverId/chat/$id"!</div>
}
