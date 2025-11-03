import IconDashboard from "~/components/icons/icon-dashboard"
import IconMsgs from "~/components/icons/icon-msgs"
import { Logo } from "~/components/logo"
import { Link } from "~/components/ui/link"
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarItem,
	SidebarLink,
	SidebarSection,
	SidebarSectionGroup,
	SidebarSeparator,
	useSidebar,
} from "~/components/ui/sidebar"
import { useOrganization } from "~/hooks/use-organization"

export function NavSidebar() {
	const { isMobile } = useSidebar()

	const { slug } = useOrganization()

	return (
		<Sidebar
			collapsible="none"
			className="hidden w-[calc(var(--sidebar-width-dock)+1px)] md:flex md:border-r"
		>
			<SidebarHeader className="h-14 px-3 py-4">
				<Link href="/" className="flex items-center justify-center">
					<Logo className="size-7" />
				</Link>
			</SidebarHeader>
			<SidebarSeparator className="hidden sm:block" />
			<SidebarContent className="mask-none">
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
					</SidebarSection>
				</SidebarSectionGroup>
			</SidebarContent>
		</Sidebar>
	)
}
