"use client"

import { useMatchRoute } from "@tanstack/react-router"
import IconBell from "~/components/icons/icon-bell"
import IconCube from "~/components/icons/icon-cube"
import IconPaintbrush from "~/components/icons/icon-paintbrush"
import IconArrowPath from "~/components/icons/icon-arrow-path"
import IconUser from "~/components/icons/icon-user"
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
import { isTauri, isTauriMacOS } from "~/lib/tauri"

export function MySettingsSidebar() {
	const { slug } = useOrganization()
	const matchRoute = useMatchRoute()
	const hasTauriTitlebar = isTauriMacOS()

	const isRouteActive = (to: string, exact = false) => {
		return matchRoute({
			to,
			params: { orgSlug: slug },
			fuzzy: !exact,
		})
	}

	return (
		<Sidebar collapsible="none" className="flex flex-1">
			<SidebarHeader
				data-tauri-drag-region
				className={`border-b py-4 ${hasTauriTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border" : "h-14"}`}
			>
				<span className="text-muted-fg text-xs font-medium uppercase tracking-wider">
					My Settings
				</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<SidebarSection>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/my-settings", true)}>
							<SidebarLink
								to="/$orgSlug/my-settings"
								params={{ orgSlug: slug }}
								activeOptions={{ exact: true }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconPaintbrush data-slot="icon" />
								<SidebarLabel>Appearance</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/my-settings/profile")}>
							<SidebarLink
								to="/$orgSlug/my-settings/profile"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconUser data-slot="icon" />
								<SidebarLabel>Profile</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/my-settings/linked-accounts")}>
						<SidebarLink
							to="/$orgSlug/my-settings/linked-accounts"
							params={{ orgSlug: slug }}
							activeProps={{
								className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
							}}
						>
							<IconArrowPath data-slot="icon" />
							<SidebarLabel>Linked Accounts</SidebarLabel>
						</SidebarLink>
					</SidebarItem>
					<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/my-settings/notifications")}>
							<SidebarLink
								to="/$orgSlug/my-settings/notifications"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconBell data-slot="icon" />
								<SidebarLabel>Notifications</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						{isTauri() && (
							<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/my-settings/desktop")}>
								<SidebarLink
									to="/$orgSlug/my-settings/desktop"
									params={{ orgSlug: slug }}
									activeProps={{
										className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
									}}
								>
									<IconCube data-slot="icon" />
									<SidebarLabel>Desktop</SidebarLabel>
								</SidebarLink>
							</SidebarItem>
						)}
					</SidebarSection>
				</SidebarSectionGroup>
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
				<UserMenu />
			</SidebarFooter>
		</Sidebar>
	)
}
