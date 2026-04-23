import type { ChannelId } from "@hazel/schema"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import type { CommandPalettePageType } from "~/atoms/command-palette-state"
import { useModal } from "~/atoms/modal-atoms"
import { Loader } from "~/components/loader"
import { MobileNav } from "~/components/mobile-nav"

// Lazy load heavy components - only loaded when opened
const CommandPalette = lazy(() =>
	import("~/components/command-palette").then((m) => ({ default: m.CommandPalette })),
)
const CreateChannelModal = lazy(() =>
	import("~/components/modals/create-channel-modal").then((m) => ({ default: m.CreateChannelModal })),
)
const CreateDmModal = lazy(() =>
	import("~/components/modals/create-dm-modal").then((m) => ({ default: m.CreateDmModal })),
)
const CreateOrganizationModal = lazy(() =>
	import("~/components/modals/create-organization-modal").then((m) => ({
		default: m.CreateOrganizationModal,
	})),
)
const CreateSectionModal = lazy(() =>
	import("~/components/modals/create-section-modal").then((m) => ({ default: m.CreateSectionModal })),
)
const DeleteChannelModal = lazy(() =>
	import("~/components/modals/delete-channel-modal").then((m) => ({ default: m.DeleteChannelModal })),
)
const EmailInviteModal = lazy(() =>
	import("~/components/modals/email-invite-modal").then((m) => ({ default: m.EmailInviteModal })),
)
const JoinChannelModal = lazy(() =>
	import("~/components/modals/join-channel-modal").then((m) => ({ default: m.JoinChannelModal })),
)
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { TauriMenuListener } from "~/components/tauri-menu-listener"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { useAppHotkey } from "~/hooks/use-app-hotkey"
import { useOrganization } from "~/hooks/use-organization"
import { usePermission } from "~/hooks/use-permission"
import { useAuth } from "~/lib/auth"
import { NotificationSoundProvider } from "~/providers/notification-sound-provider"
import { PresenceProvider } from "~/providers/presence-provider"

export const Route = createFileRoute("/_app/$orgSlug")({
	component: RouteComponent,
	loader: async () => {
		const [
			{
				attachmentCollection,
				channelCollection,
				channelMemberCollection,
				channelSectionCollection,
				organizationCollection,
				organizationMemberCollection,
				userCollection,
			},
			{ threadWithMemberCollection },
		] = await Promise.all([import("~/db/collections"), import("~/db/materialized-collections")])
		await Promise.all([
			channelCollection.preload(),
			channelMemberCollection.preload(),
			channelSectionCollection.preload(),
			attachmentCollection.preload(),
			organizationCollection.preload(),
			organizationMemberCollection.preload(),
			userCollection.preload(),
			threadWithMemberCollection.preload(),
		])

		return null
	},
})

function RouteComponent() {
	const [openCmd, setOpenCmd] = useState(false)
	const [initialPage, setInitialPage] = useState<CommandPalettePageType>("home")
	const { user } = useAuth()
	const { isLoading: isOrgLoading } = useOrganization()
	const { can } = usePermission()

	// Modal state and actions from hooks
	const newChannelModal = useModal("new-channel")
	const createDmModal = useModal("create-dm")
	const joinChannelModal = useModal("join-channel")
	const emailInviteModal = useModal("email-invite")
	const createOrgModal = useModal("create-organization")
	const createSectionModal = useModal("create-section")
	const deleteChannelModal = useModal("delete-channel")

	const openChannelsBrowser = () => {
		setInitialPage("join-channel")
		setOpenCmd(true)
	}

	const openCommandPaletteHome = () => {
		setInitialPage("home")
		setOpenCmd(true)
	}

	const openSearch = () => {
		setInitialPage("search")
		setOpenCmd(true)
	}

	// Global keyboard shortcuts
	useAppHotkey("commandPalette.open", openCommandPaletteHome)
	useAppHotkey("search.open", openSearch)
	useAppHotkey("channel.create", () => can("channel.create") && newChannelModal.open())
	useAppHotkey("dm.create", () => createDmModal.open())
	useAppHotkey("invite.email", () => emailInviteModal.open())

	// Show loader while org is loading
	if (isOrgLoading) {
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
				<TauriMenuListener />
				<NotificationSoundProvider>
					<AppSidebar openChannelsBrowser={openChannelsBrowser} />
					<SidebarInset className="pb-16 md:pb-0">
						<Outlet />
						<MobileNav />
						<Suspense fallback={null}>
							<CommandPalette
								isOpen={openCmd}
								onOpenChange={setOpenCmd}
								initialPage={initialPage}
							/>
						</Suspense>
					</SidebarInset>

					{/* Global Modals - controlled by hook state, lazy loaded */}
					<Suspense fallback={null}>
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
					</Suspense>
				</NotificationSoundProvider>
			</PresenceProvider>
		</SidebarProvider>
	)
}
