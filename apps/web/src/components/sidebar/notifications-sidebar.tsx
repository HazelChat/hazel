"use client"

import { useMatchRoute } from "@tanstack/react-router"
import { useState } from "react"
import IconBell from "~/components/icons/icon-bell"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconMsgs from "~/components/icons/icon-msgs"
import IconThread from "~/components/icons/icon-thread"
import { Button } from "~/components/ui/button"
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
import { useNotifications } from "~/hooks/use-notifications"
import { useOrganization } from "~/hooks/use-organization"
import { isTauriMacOS } from "~/lib/tauri"

export function NotificationsSidebar() {
	const { slug } = useOrganization()
	const matchRoute = useMatchRoute()
	const hasTauriTitlebar = isTauriMacOS()
	const { unreadCount, markAllAsRead } = useNotifications()
	const [isMarkingAll, setIsMarkingAll] = useState(false)

	// Helper to check if a route is active
	const isRouteActive = (to: string, exact = false) => {
		return matchRoute({
			to,
			params: { orgSlug: slug },
			fuzzy: !exact,
		})
	}

	const handleMarkAllAsRead = async () => {
		setIsMarkingAll(true)
		try {
			await markAllAsRead()
		} finally {
			setIsMarkingAll(false)
		}
	}

	return (
		<Sidebar collapsible="none" className="flex flex-1">
			<SidebarHeader
				data-tauri-drag-region
				className={`border-b py-4 ${hasTauriTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border" : ""}`}
			>
				<span className="text-muted-fg text-xs font-medium uppercase tracking-wider">Activity</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<SidebarSection>
						<SidebarItem
							isCurrent={
								!!isRouteActive("/$orgSlug/notifications", true) ||
								!!isRouteActive("/$orgSlug/notifications/")
							}
						>
							<SidebarLink
								to="/$orgSlug/notifications"
								params={{ orgSlug: slug }}
								activeOptions={{ exact: true }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconBell data-slot="icon" />
								<SidebarLabel>All Activity</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/notifications/general")}>
							<SidebarLink
								to="/$orgSlug/notifications/general"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconHashtag data-slot="icon" />
								<SidebarLabel>Channels</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/notifications/threads")}>
							<SidebarLink
								to="/$orgSlug/notifications/threads"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconThread data-slot="icon" />
								<SidebarLabel>Threads</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem isCurrent={!!isRouteActive("/$orgSlug/notifications/dms")}>
							<SidebarLink
								to="/$orgSlug/notifications/dms"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconMsgs data-slot="icon" />
								<SidebarLabel>Direct Messages</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>

					{unreadCount > 0 && (
						<SidebarSection>
							<Button
								intent="outline"
								size="sm"
								className="w-full"
								onPress={handleMarkAllAsRead}
								isPending={isMarkingAll}
							>
								Mark all as read
							</Button>
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
