import { IconChevronUpDown } from "~/components/icons/icon-chevron-up-down"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { FeedbackModal } from "~/components/modals/feedback-modal"
import { Avatar } from "~/components/ui/avatar"
import {
	Menu,
	MenuContent,
	MenuHeader,
	MenuItem,
	MenuItemLink,
	MenuLabel,
	MenuSection,
	MenuSeparator,
	MenuTrigger,
} from "~/components/ui/menu"
import { SidebarLabel } from "~/components/ui/sidebar"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import IconGear from "../icons/icon-gear"
import IconLogout from "../icons/icon-logout"
import IconProfiles2 from "../icons/icon-persons-2"
import IconSupport from "../icons/icon-support"

export function UserMenu() {
	const { user, logout } = useAuth()
	const { slug: orgSlug } = useOrganization()
	const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

	// Fallbacks for missing user data
	const displayName =
		user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "User"
	const avatarUrl = user?.avatarUrl || undefined

	return (
		<>
			<Menu>
				<MenuTrigger
					className="flex w-full items-center justify-between rounded-lg border bg-accent/20 px-2 py-1 hover:bg-accent/50"
					aria-label="Profile"
				>
					<div className="flex min-w-0 items-center gap-x-2">
						<Avatar
							className={twJoin([
								"[--avatar-radius:7%] group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6",
								"size-8 *:size-8",
							])}
							isSquare
							src={avatarUrl}
						/>

						<div className="in-data-[collapsible=dock]:hidden min-w-0 text-sm">
							<SidebarLabel>{displayName}</SidebarLabel>
							{user?.email && (
								<span className="-mt-0.5 block max-w-36 truncate text-muted-fg">
									{user.email}
								</span>
							)}
						</div>
					</div>
					<IconChevronUpDown data-slot="chevron" className="size-4" />
				</MenuTrigger>
				<MenuContent
					className="in-data-[collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
					placement="bottom right"
				>
					<MenuSection>
						<MenuHeader separator>
							<span className="block">{displayName}</span>
							{user?.email && (
								<span className="block truncate font-normal text-muted-fg">{user.email}</span>
							)}
						</MenuHeader>
					</MenuSection>

					<MenuItemLink
						to="/$orgSlug/profile/$userId"
						params={{
							orgSlug: orgSlug,
							userId: user?.id || "",
						}}
					>
						<IconProfiles2 />
						<MenuLabel>Profile</MenuLabel>
					</MenuItemLink>
					<MenuItemLink
						to="/$orgSlug/my-settings"
						params={{
							orgSlug: orgSlug,
						}}
					>
						<IconGear />
						<MenuLabel>My Settings</MenuLabel>
					</MenuItemLink>

					<MenuSeparator />

					<MenuItem onAction={() => setFeedbackModalOpen(true)}>
						<IconSupport />
						<MenuLabel>Feedback</MenuLabel>
					</MenuItem>
					<MenuSeparator />
					<MenuItem onAction={() => logout()}>
						<IconLogout />
						<MenuLabel>Log out</MenuLabel>
					</MenuItem>
				</MenuContent>
			</Menu>

			<FeedbackModal isOpen={feedbackModalOpen} onOpenChange={setFeedbackModalOpen} />
		</>
	)
}
