import IconBell from "~/components/icons/icon-bell"
import IconDashboard from "~/components/icons/icon-dashboard"
import IconGear from "~/components/icons/icon-gear"
import IconMsgs from "~/components/icons/icon-msgs"
import { Logo } from "~/components/logo"
import { Link } from "~/components/ui/link"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLink,
	SidebarSection,
	SidebarSectionGroup,
	SidebarSeparator,
	useSidebar,
} from "~/components/ui/sidebar"
import { useAppVersion } from "~/lib/version"
import { useUnreadNotificationCount } from "~/hooks/use-notifications"
import { useOrganization } from "~/hooks/use-organization"
import { isTauriMacOS } from "~/lib/tauri"

export function NavSidebar() {
	const { isMobile } = useSidebar()
	const { slug } = useOrganization()
	const { unreadCount } = useUnreadNotificationCount()
	const version = useAppVersion()
	const hasTauriTitlebar = isTauriMacOS()

	return (
		<Sidebar
			collapsible="none"
			className={`hidden w-[calc(var(--sidebar-width-dock)+1px)] md:flex ${hasTauriTitlebar ? "" : "md:border-r"}`}
		>
			<SidebarHeader
				data-tauri-drag-region
				className={`px-3 py-4 ${hasTauriTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:bottom-0 before:border-t before:border-r before:border-sidebar-border" : "h-14"}`}
			>
				<Link
					href={{
						to: "/",
					}}
					className="flex items-center justify-center"
				>
					<Logo className="size-7" />
				</Link>
			</SidebarHeader>
			{!hasTauriTitlebar && <SidebarSeparator className="hidden sm:block" />}
			<SidebarContent
				className={`mask-none ${hasTauriTitlebar ? "border-r border-sidebar-border" : ""}`}
			>
				<SidebarSectionGroup>
					<SidebarSection className="p-2! *:data-[slot=sidebar-section-inner]:gap-y-2">
						<SidebarItem
							aria-label="Home"
							className="size-9 justify-items-center"
							tooltip={{
								children: "Home",
								hidden: isMobile,
							}}
						>
							<SidebarLink
								to="/$orgSlug"
								params={{ orgSlug: slug }}
								activeOptions={{
									exact: true,
								}}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
								}}
							>
								<IconDashboard className="size-5" />
							</SidebarLink>
						</SidebarItem>
						<SidebarItem
							aria-label="Chat"
							className="size-9 justify-items-center"
							tooltip={{
								children: "Chat",
								hidden: isMobile,
							}}
						>
							<SidebarLink
								to="/$orgSlug/chat"
								params={{ orgSlug: slug }}
								activeOptions={{
									exact: true,
								}}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
								}}
							>
								<IconMsgs className="size-5" />
							</SidebarLink>
						</SidebarItem>
						<SidebarItem
							aria-label="Notifications"
							className="size-9 justify-items-center"
							tooltip={{
								children: "Notifications",
								hidden: isMobile,
							}}
						>
							<SidebarLink
								to="/$orgSlug/notifications"
								params={{ orgSlug: slug }}
								activeOptions={{
									exact: true,
								}}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
								}}
							>
								<div className="relative">
									<IconBell className="size-5" />
									{unreadCount > 0 && (
										<span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-danger font-medium text-[10px] text-danger-fg">
											{unreadCount > 9 ? "9+" : unreadCount}
										</span>
									)}
								</div>
							</SidebarLink>
						</SidebarItem>
						<SidebarItem
							aria-label="Settings"
							className="size-9 justify-items-center"
							tooltip={{
								children: "Settings",
								hidden: isMobile,
							}}
						>
							<SidebarLink
								to="/$orgSlug/settings"
								params={{ orgSlug: slug }}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
								}}
							>
								<IconGear className="size-5" />
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>
				</SidebarSectionGroup>
			</SidebarContent>
			<SidebarFooter className={`p-2 ${hasTauriTitlebar ? "border-r border-sidebar-border" : ""}`}>
				{version && (
					<span className="text-center text-[10px] font-mono text-muted-fg">v{version}</span>
				)}
			</SidebarFooter>
		</Sidebar>
	)
}
