import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/chat")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex h-full items-center justify-center">
			<h1 className="font-semibold text-2xl">Chat</h1>
		</div>
	)
}
