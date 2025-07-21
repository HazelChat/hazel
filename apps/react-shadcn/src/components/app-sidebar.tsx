import { convexQuery } from "@convex-dev/react-query"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { ChannelItem, DmChannelLink } from "./channel-item"
import IconChatChatting1 from "./icons/IconChatChatting1"
import IconGridDashboard01DuoSolid from "./icons/IconGridDashboard01DuoSolid"
import IconNotificationBellOn1 from "./icons/IconNotificationBellOn1"
import IconPlusStroke from "./icons/IconPlusStroke"
import { IconButton } from "./ui/button"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export const AppSidebar = () => {
	const channelsQuery = useQuery(
		convexQuery(api.channels.getChannelsForOrganization, {
			favoriteFilter: {
				favorite: false,
			},
		}),
	)

	const dmChannels = useMemo(() => channelsQuery.data?.dmChannels || [], [channelsQuery.data])

	const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false)

	// TODO: Add presence state when available
	const presenceState = { presenceList: [] }

	return (
		<Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
			<Sidebar
				collapsible="none"
				className="w-[calc(var(--sidebar-width-icon)+1px)]! border-primary border-r"
			>
				<SidebarHeader>{/* <WorkspaceSwitcher /> */}</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenuItem>
								<SidebarMenuButton className="px-2.5 md:px-2" asChild>
									<Link
										to="/app"
										activeOptions={{
											exact: true,
										}}
									>
										<IconGridDashboard01DuoSolid />
										<span>Home</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton className="px-2.5 md:px-2" asChild>
									<Link
										to="/app/chat"
										activeOptions={{
											exact: true,
										}}
									>
										<IconChatChatting1 />
										<span>Chat</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>{/* <NavUser /> */}</SidebarFooter>
			</Sidebar>
			<Sidebar collapsible="none" className="hidden flex-1 border-primary md:flex">
				<SidebarHeader className="gap-3.5 p-4">
					<div className="flex w-full items-center justify-between">
						<ActiveServer />
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<IconNotificationBellOn1 />
									Notifications
									<SidebarMenuBadge className="rounded-full bg-destructive">
										1
									</SidebarMenuBadge>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarGroupContent>
					</SidebarGroup>
					{/* <SidebarFavoriteGroup /> */}
					<SidebarGroup>
						<SidebarGroupLabel>Channels</SidebarGroupLabel>
						<SidebarGroupAction>
							<Dialog
								open={createChannelModalOpen}
								onOpenChange={setCreateChannelModalOpen}
							>
								<DialogTrigger asChild>
									<IconButton className="size-4.5" asChild>
										<IconPlusStroke />
									</IconButton>
								</DialogTrigger>
								<DialogContent>
									<Tabs defaultValue={"join"}>
										<TabsList>
											<TabsTrigger value="join">Join</TabsTrigger>
											<TabsTrigger value="create">Create New</TabsTrigger>
										</TabsList>
										<TabsContent value="join">
											{/* <JoinPublicChannel
												onSuccess={() => setCreateChannelModalOpen(false)}
											/> */}
										</TabsContent>
										<TabsContent value="create">
											{/* <CreateChannelForm
												onSuccess={() => setCreateChannelModalOpen(false)}
											/> */}
										</TabsContent>
									</Tabs>
								</DialogContent>
							</Dialog>
						</SidebarGroupAction>
						<SidebarGroupContent>
							<SidebarMenu>
								{channelsQuery.data?.organizationChannels?.map((channel) => (
									<ChannelItem key={channel._id} channel={channel} />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
					<SidebarGroup>
						<SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
						<SidebarGroupAction>{/* <CreateDmDialog /> */}</SidebarGroupAction>
						<SidebarMenu>
							{dmChannels.map((channel) => (
								<DmChannelLink
									key={channel._id}
									userPresence={presenceState.presenceList}
									channel={channel}
								/>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	)
}

const ActiveServer = () => {
	const { data } = useQuery(convexQuery(api.me.getOrganization, {}))

	useEffect(() => {
		if (data?.directive === "redirect") {
			console.log("TODO redirect to onboarding")
		}
	}, [data?.directive])

	return <div className="font-semibold text-foreground text-lg">{data?.data?.name}</div>
}
