import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { AppSidebar } from "~/components/app-sidebar/app-sidebar"
import { SidebarMobile } from "~/components/app-sidebar/sidebar-mobile"
import { CommandPalette } from "~/components/command-palette"
import { NotificationManager } from "~/components/notification-manager"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import {
	attachmentCollection,
	channelCollection,
	channelMemberCollection,
	directMessageParticipantCollection,
	organizationCollection,
	organizationMemberCollection,
} from "~/db/collections"

export const Route = createFileRoute("/_app/$orgSlug")({
	component: RouteComponent,
	loader: async () => {
		// TODO: Should be scoped to the organization
		await channelCollection.preload()
		await channelMemberCollection.preload()
		await attachmentCollection.preload()
		await directMessageParticipantCollection.preload()

		await organizationCollection.preload()
		await organizationMemberCollection.preload()

		return null
	},
})

function RouteComponent() {
	const [openCmd, setOpenCmd] = useState(false)

	return (
		<SidebarProvider>
			<NotificationManager />
			<AppSidebar setOpenCmd={setOpenCmd} />
			<SidebarInset>
				<ErrorBoundary fallback={<></>}>
					<SidebarMobile />
				</ErrorBoundary>
				<Outlet />
				<CommandPalette isOpen={openCmd} onOpenChange={setOpenCmd} />
			</SidebarInset>
		</SidebarProvider>
	)
}
