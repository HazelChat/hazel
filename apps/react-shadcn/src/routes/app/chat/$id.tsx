import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/chat/$id")({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/app/chat/$id"!</div>
}
