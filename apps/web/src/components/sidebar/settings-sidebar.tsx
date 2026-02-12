"use client"

import { useMatchRoute } from "@tanstack/react-router"
import IconArrowPath from "~/components/icons/icon-arrow-path"
import IconCode from "~/components/icons/icon-code"
import IconEmojiAdd from "~/components/icons/icon-emoji-add"
import IconGear from "~/components/icons/icon-gear"
import IconGridCirclePlus from "~/components/icons/icon-grid-circle-plus"
import IconIntegratio from "~/components/icons/icon-integratio-"
import IconLock from "~/components/icons/icon-lock"
import IconShop from "~/components/icons/icon-shop"
import IconUsers from "~/components/icons/icon-users"
import IconUsersPlus from "~/components/icons/icon-users-plus"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarLink,
	SidebarSection,
	SidebarSectionGroup,
} from "~/components/ui/sidebar"
import { UserMenu } from "~/components/sidebar/user-menu"
import { useOrganization } from "~/hooks/use-organization"
import { isTauriMacOS } from "~/lib/tauri"

export function SettingsSidebar() {
	const { slug } = useOrganization()
	const matchRoute = useMatchRoute()
	const hasTauriTitlebar = isTauriMacOS()

	// Helper to check if a route is active (for nested routes)
	const isRouteActive = (to: string, exact = false) => {
		return matchRoute({
			to,
			params: { orgSlug: slug },
			fuzzy: !exact,
		})
	}

	// Helper to check if the base integrations route is active (not sub-routes)
	const isBaseIntegrationsRouteActive = () => {
		const isExactMatch = !!isRouteActive("/$orgSlug/settings/integrations", true)
		const isFuzzyMatch = !!isRouteActive("/$orgSlug/settings/integrations")
		const isOnSubRoute =
			!!isRouteActive("/$orgSlug/settings/integrations/marketplace") ||
			!!isRouteActive("/$orgSlug/settings/integrations/installed") ||
			!!isRouteActive("/$orgSlug/settings/integrations/your-apps")

		return isExactMatch || (isFuzzyMatch && !isOnSubRoute)
	}

	return (
		<Sidebar collapsible="none" className="flex flex-1">
			<SidebarHeader
				data-tauri-drag-region
				className={`border-b py-4 ${hasTauriTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border" : "h-14"}`}
			>
				<span className="text-muted-fg text-xs font-medium uppercase tracking-wider">Settings</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<SidebarSection>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings", true)}>
							<SidebarLink
								to="/$orgSlug/settings"
								params={{ orgSlug: slug }}
								activeOptions={{ exact: true }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconGear data-slot="icon" />
								<SidebarLabel>General</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/team", true)}>
							<SidebarLink
								to="/$orgSlug/settings/team"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconUsers data-slot="icon" />
								<SidebarLabel>Team</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/invitations")}>
							<SidebarLink
								to="/$orgSlug/settings/invitations"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconUsersPlus data-slot="icon" />
								<SidebarLabel>Invitations</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/authentication")}>
							<SidebarLink
								to="/$orgSlug/settings/authentication"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconLock data-slot="icon" />
								<SidebarLabel>Authentication</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/custom-emojis")}>
							<SidebarLink
								to="/$orgSlug/settings/custom-emojis"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconEmojiAdd data-slot="icon" />
								<SidebarLabel>Custom Emoji</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>

					{/* Apps & Integrations Section */}
					<SidebarSection label="Apps & Integrations">
						<SidebarItem isCurrent={isBaseIntegrationsRouteActive()}>
							<SidebarLink
								to="/$orgSlug/settings/integrations"
								params={{ orgSlug: slug }}
								activeOptions={{ exact: true }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconIntegratio data-slot="icon" />
								<SidebarLabel>Integrations</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem
							isCurrent={!!isRouteActive("/$orgSlug/settings/integrations/marketplace")}
						>
							<SidebarLink
								to="/$orgSlug/settings/integrations/marketplace"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconShop data-slot="icon" />
								<SidebarLabel>Marketplace</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/integrations/installed")}>
							<SidebarLink
								to="/$orgSlug/settings/integrations/installed"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconGridCirclePlus data-slot="icon" />
								<SidebarLabel>Installed Apps</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/integrations/your-apps")}>
							<SidebarLink
								to="/$orgSlug/settings/integrations/your-apps"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconCode data-slot="icon" />
								<SidebarLabel>Your Apps</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>

					{/* Chat Sync Section */}
					<SidebarSection label="Chat Sync">
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/chat-sync")}>
							<SidebarLink
								to="/$orgSlug/settings/chat-sync"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconArrowPath data-slot="icon" />
								<SidebarLabel>Connections</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>

					{/* Debug - only in development */}
					{!import.meta.env.PROD && (
						<SidebarSection>
							<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/settings/debug")}>
								<SidebarLink
									to="/$orgSlug/settings/debug"
									params={{ orgSlug: slug }}
									activeProps={{
										className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
									}}
								>
									<IconCode data-slot="icon" />
									<SidebarLabel>Debug</SidebarLabel>
								</SidebarLink>
							</SidebarItem>
						</SidebarSection>
					)}
				</SidebarSectionGroup>
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
				<UserMenu />
			</SidebarFooter>
		</Sidebar>
	)
}
