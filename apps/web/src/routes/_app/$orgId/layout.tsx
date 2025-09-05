import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"
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
} from "~/db/collections"

export const Route = createFileRoute("/_app/$orgId")({
	component: RouteComponent,
	loader: async () => {
		// TODO: Should be scoped to the organization
		await channelCollection.preload()
		await channelMemberCollection.preload()
		await attachmentCollection.preload()
		await directMessageParticipantCollection.preload()

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
				<SidebarMobile />
				<Outlet />
				<CommandPalette isOpen={openCmd} onOpenChange={setOpenCmd} />
			</SidebarInset>
		</SidebarProvider>
	)
}
