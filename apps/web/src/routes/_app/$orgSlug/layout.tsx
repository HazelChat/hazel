import type { ChannelId } from "@hazel/schema"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import type { CommandPalettePage } from "~/atoms/command-palette-atoms"
import { useModal } from "~/atoms/modal-atoms"
import { CommandPalette } from "~/components/command-palette"
import { Loader } from "~/components/loader"
import { MobileNav } from "~/components/mobile-nav"
import { CreateChannelModal } from "~/components/modals/create-channel-modal"
import { CreateDmModal } from "~/components/modals/create-dm-modal"
import { CreateOrganizationModal } from "~/components/modals/create-organization-modal"
import { CreateSectionModal } from "~/components/modals/create-section-modal"
import { DeleteChannelModal } from "~/components/modals/delete-channel-modal"
import { EmailInviteModal } from "~/components/modals/email-invite-modal"
import { JoinChannelModal } from "~/components/modals/join-channel-modal"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import {
	attachmentCollection,
	channelCollection,
	channelMemberCollection,
	channelSectionCollection,
	organizationCollection,
	organizationMemberCollection,
	userCollection,
} from "~/db/collections"
import { useKeyboardShortcut } from "~/hooks/use-keyboard-shortcut"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { NotificationSoundProvider } from "~/providers/notification-sound-provider"
import { PresenceProvider } from "~/providers/presence-provider"

export const Route = createFileRoute("/_app/$orgSlug")({
	component: RouteComponent,
	loader: async () => {
		// TODO: Should be scoped to the organization
		await channelCollection.preload()
		await channelMemberCollection.preload()
		await channelSectionCollection.preload()
		await attachmentCollection.preload()

		await organizationCollection.preload()
		await organizationMemberCollection.preload()
		await userCollection.preload()

		return null
	},
})

function RouteComponent() {
	const [openCmd, setOpenCmd] = useState(false)
	const [initialPage, setInitialPage] = useState<CommandPalettePage>("home")
	const { user, login } = useAuth()
	const { organizationId, isLoading: isOrgLoading } = useOrganization()
	const isRedirecting = useRef(false)

	// Modal state and actions from hooks
	const newChannelModal = useModal("new-channel")
	const createDmModal = useModal("create-dm")
	const joinChannelModal = useModal("join-channel")
	const emailInviteModal = useModal("email-invite")
	const createOrgModal = useModal("create-organization")
	const createSectionModal = useModal("create-section")
	const deleteChannelModal = useModal("delete-channel")

	const openChannelsBrowser = () => {
		setInitialPage("channels")
		setOpenCmd(true)
	}

	// Global keyboard shortcuts
	useKeyboardShortcut("n", () => newChannelModal.open(), {
		meta: true,
		alt: true,
	})
	useKeyboardShortcut("d", () => createDmModal.open(), {
		meta: true,
		alt: true,
	})
	useKeyboardShortcut("i", () => emailInviteModal.open(), {
		meta: true,
		alt: true,
	})

	// Sync organization context to user session
	// If user's JWT doesn't have org context (or has different org), re-authenticate with correct org
	useEffect(() => {
		if (isOrgLoading || !organizationId || !user || isRedirecting.current) return

		// If user's session org doesn't match the route's org, re-login with correct org context
		if (user.organizationId !== organizationId) {
			isRedirecting.current = true
			login({
				organizationId,
				returnTo: window.location.pathname + window.location.search + window.location.hash,
			})
		}
	}, [user, organizationId, isOrgLoading, login])

	// Show loader while org is loading or while redirecting for org context sync
	if (isOrgLoading || (user && organizationId && user.organizationId !== organizationId)) {
		return <Loader />
	}

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "350px",
				} as React.CSSProperties
			}
		>
			<PresenceProvider>
				<NotificationSoundProvider>
					<AppSidebar openChannelsBrowser={openChannelsBrowser} />
					<SidebarInset className="pb-16 md:pb-0">
						<Outlet />
						<MobileNav />
						<CommandPalette
							isOpen={openCmd}
							onOpenChange={setOpenCmd}
							initialPage={initialPage}
						/>
					</SidebarInset>

					{/* Global Modals - controlled by hook state */}
					<CreateChannelModal
						isOpen={newChannelModal.isOpen}
						onOpenChange={(open) => !open && newChannelModal.close()}
					/>
					<CreateDmModal
						isOpen={createDmModal.isOpen}
						onOpenChange={(open) => !open && createDmModal.close()}
					/>
					<JoinChannelModal
						isOpen={joinChannelModal.isOpen}
						onOpenChange={(open) => !open && joinChannelModal.close()}
					/>
					<EmailInviteModal
						isOpen={emailInviteModal.isOpen}
						onOpenChange={(open) => !open && emailInviteModal.close()}
					/>
					<CreateOrganizationModal
						isOpen={createOrgModal.isOpen}
						onOpenChange={(open) => !open && createOrgModal.close()}
					/>
					<CreateSectionModal
						isOpen={createSectionModal.isOpen}
						onOpenChange={(open) => !open && createSectionModal.close()}
					/>
					{deleteChannelModal.metadata?.channelId ? (
						<DeleteChannelModal
							channelId={deleteChannelModal.metadata.channelId as ChannelId}
							channelName={(deleteChannelModal.metadata.channelName as string) ?? ""}
							isOpen={deleteChannelModal.isOpen}
							onOpenChange={(open) => !open && deleteChannelModal.close()}
						/>
					) : null}
				</NotificationSoundProvider>
			</PresenceProvider>
		</SidebarProvider>
	)
}
