import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/$orgSlug/settings/chat-sync")({
	component: ChatSyncLayout,
})

function ChatSyncLayout() {
	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<Outlet />
		</div>
	)
}
