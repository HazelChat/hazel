"use client"

import { useMatchRoute } from "@tanstack/react-router"
import { Button as PrimitiveButton } from "react-aria-components"
import { useModal } from "~/atoms/modal-atoms"
import { IconChevronUpDown } from "~/components/icons/icon-chevron-up-down"
import IconArrowPath from "~/components/icons/icon-arrow-path"
import IconBell from "~/components/icons/icon-bell"
import IconCube from "~/components/icons/icon-cube"
import IconGear from "~/components/icons/icon-gear"
import IconPaintbrush from "~/components/icons/icon-paintbrush"
import IconUser from "~/components/icons/icon-user"
import IconUsers from "~/components/icons/icon-users"
import IconUsersPlus from "~/components/icons/icon-users-plus"
import { IconServers } from "~/components/icons/icon-servers"
import { SwitchServerMenu } from "~/components/sidebar/switch-server-menu"
import { UserMenu } from "~/components/sidebar/user-menu"
import { Avatar } from "~/components/ui/avatar"
import {
	Menu,
	MenuContent,
	MenuItem,
	MenuLabel,
	MenuSection,
	MenuSeparator,
	MenuSubMenu,
} from "~/components/ui/menu"
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
	useSidebar,
} from "~/components/ui/sidebar"
import { useOrganization } from "~/hooks/use-organization"
import { isDesktopRuntime, isDesktopMacOS } from "~/lib/desktop-runtime"

export function MySettingsSidebar() {
	const { isMobile } = useSidebar()
	const { organization, slug } = useOrganization()
	const matchRoute = useMatchRoute()
	const hasDesktopTitlebar = isDesktopMacOS()
	const createOrgModal = useModal("create-organization")
	const emailInviteModal = useModal("email-invite")

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
				className={`electrobun-webkit-app-region-drag border-b ${hasDesktopTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border" : "h-14"}`}
			>
				<Menu>
					<PrimitiveButton className="group/switcher relative flex items-center justify-between gap-x-2 font-semibold outline-hidden text-fg/80 hover:text-fg transition-colors focus-visible:ring focus-visible:ring-primary">
						<div className="flex w-full items-center gap-1">
							<span className="flex gap-x-2 font-medium text-sm/6">
								<Avatar
									isSquare
									size="sm"
									src={organization?.logoUrl ?? undefined}
									seed={organization?.name ?? undefined}
								/>
								{organization?.name}
							</span>
							<IconChevronUpDown className="ml-auto size-4 text-muted-fg group-hover/switcher:text-fg transition-colors" />
						</div>
					</PrimitiveButton>
					<MenuContent className="min-w-(--trigger-width)">
						{isMobile ? (
							<SwitchServerMenu onCreateOrganization={() => createOrgModal.open()} />
						) : (
							<>
								<MenuSection>
									<MenuItem onAction={() => emailInviteModal.open()}>
										<IconUsersPlus />
										<MenuLabel>Invite people</MenuLabel>
									</MenuItem>
									<MenuItem
										href={{
											to: "/$orgSlug/settings/team",
											params: { orgSlug: slug },
										}}
									>
										<IconUsers />
										<MenuLabel>Manage members</MenuLabel>
									</MenuItem>
								</MenuSection>

								<MenuSubMenu>
									<MenuItem>
										<IconServers />
										<MenuLabel>Switch Server</MenuLabel>
									</MenuItem>
									<MenuContent>
										<SwitchServerMenu
											onCreateOrganization={() => createOrgModal.open()}
										/>
									</MenuContent>
								</MenuSubMenu>

								<MenuSeparator />

								<MenuSection>
									<MenuItem
										href={{
											to: "/$orgSlug/settings",
											params: { orgSlug: slug },
										}}
									>
										<IconGear />
										<MenuLabel>Server settings</MenuLabel>
									</MenuItem>
								</MenuSection>
							</>
						)}
					</MenuContent>
				</Menu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<div className="px-3 pt-3 pb-1">
						<span className="text-muted-fg text-xs font-medium uppercase tracking-wider">
							My Settings
						</span>
					</div>
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
						{isDesktopRuntime() && (
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
