import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { useCallback } from "react"
import { cn } from "~/lib/utils"
import IconHashtagStroke from "./icons/IconHashtagStroke"
import IconMultipleCrossCancelStroke from "./icons/IconMultipleCrossCancelStroke"
import IconPhone2 from "./icons/IconPhone2"
import IconStar1 from "./icons/IconStar1"
import IconThreeDotsMenuHorizontalStroke from "./icons/IconThreeDotsMenuHorizontalStroke"
import IconVolumeMute1 from "./icons/IconVolumeMute1"
import IconVolumeOne1 from "./icons/IconVolumeOne1"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import { UserAvatar } from "./ui/user-avatar"

type ChannelsResponse = FunctionReturnType<typeof api.channels.getChannelsForOrganization>

export interface ChannelItemProps {
	channel: ChannelsResponse["organizationChannels"][0]
}

export const ChannelItem = ({ channel }: ChannelItemProps) => {
	const leaveChannelMutation = useConvexMutation(api.channels.leaveChannelForOrganization)
	const updateChannelPreferencesMutation = useConvexMutation(api.channels.updateChannelPreferencesForOrganization)

	const handleLeaveChannel = useCallback(() => {
		leaveChannelMutation({
			channelId: channel._id as Id<"channels">,
		})
	}, [channel._id, leaveChannelMutation])

	const handleToggleMute = useCallback(() => {
		updateChannelPreferencesMutation({
			channelId: channel._id as Id<"channels">,
			isMuted: !channel.isMuted,
		})
	}, [channel._id, channel.isMuted, updateChannelPreferencesMutation])

	const handleToggleFavorite = useCallback(() => {
		updateChannelPreferencesMutation({
			channelId: channel._id as Id<"channels">,
			isFavorite: !channel.isFavorite,
		})
	}, [channel._id, channel.isFavorite, updateChannelPreferencesMutation])

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild>
				<Link to="/app/chat" search={{ channelId: channel._id }}>
					<IconHashtagStroke className="size-5" />
					<p className={cn("text-ellipsis text-nowrap", channel.isMuted && "opacity-60")}>
						{channel.name}
					</p>
					{channel.currentUser.notificationCount > 0 && (
						<div className="-translate-y-1/2 absolute top-1/2 right-1 flex h-2.5 items-center justify-center rounded-lg border bg-muted p-2 text-xs transition-all duration-200 group-focus-within/menu-item:right-6 group-hover/menu-action:right-6 group-hover/menu-item:right-6 group-data-[state=open]/menu-action:right-6 [&:has(+[data-sidebar=menu-action][data-state=open])]:right-6">
							{channel.currentUser.notificationCount}
						</div>
					)}
				</Link>
			</SidebarMenuButton>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuAction
						showOnHover
						className="rounded-sm text-foreground data-[state=open]:bg-muted"
					>
						<IconThreeDotsMenuHorizontalStroke className="text-foreground" />
						<span className="sr-only">More</span>
					</SidebarMenuAction>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={handleToggleMute}>
						{channel.isMuted ? (
							<IconVolumeOne1 className="size-4" />
						) : (
							<IconVolumeMute1 className="size-4" />
						)}
						{channel.isMuted ? "Unmute" : "Mute"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleToggleFavorite}>
						{channel.isFavorite ? (
							<IconStar1 className="size-4 text-amber-500" />
						) : (
							<IconStar1 className="size-4" />
						)}
						{channel.isFavorite ? "Unfavorite" : "Favorite"}
					</DropdownMenuItem>
					<DropdownMenuItem className="text-destructive" onClick={handleLeaveChannel}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" />
							<line x1="21" x2="9" y1="12" y2="12" />
						</svg>
						Leave Channel
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	)
}

interface DmChannelLinkProps {
	channel: ChannelsResponse["dmChannels"][0]
	userPresence: {
		userId: string
		online: boolean
		lastDisconnected: number
	}[]
}

export const DmChannelLink = ({ channel, userPresence }: DmChannelLinkProps) => {
	const { data: me } = useQuery(convexQuery(api.me.getCurrentUser, {}))
	const updateChannelPreferencesMutation = useConvexMutation(api.channels.updateChannelPreferencesForOrganization)

	const filteredMembers = channel.members.filter((member) => member.userId !== me?._id)

	const handleToggleMute = useCallback(() => {
		updateChannelPreferencesMutation({
			channelId: channel._id as Id<"channels">,
			isMuted: !channel.isMuted,
		})
	}, [channel._id, channel.isMuted, updateChannelPreferencesMutation])

	const handleToggleFavorite = useCallback(() => {
		updateChannelPreferencesMutation({
			channelId: channel._id as Id<"channels">,
			isFavorite: !channel.isFavorite,
		})
	}, [channel._id, channel.isFavorite, updateChannelPreferencesMutation])

	const handleClose = useCallback(() => {
		updateChannelPreferencesMutation({
			channelId: channel._id as Id<"channels">,
			isHidden: true,
		})
	}, [channel._id, updateChannelPreferencesMutation])

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild>
				<Link to="/app/chat" search={{ channelId: channel._id }}>
					<div className="-space-x-4 flex items-center justify-center">
						{channel.type === "single" && filteredMembers.length === 1 ? (
							<div className="flex items-center justify-center gap-3">
								<UserAvatar
									className="size-6"
									avatarUrl={filteredMembers[0].user.avatarUrl}
									displayName={`${filteredMembers[0].user.firstName} ${filteredMembers[0].user.lastName}`}
									status={
										userPresence.find((p) => p.userId === filteredMembers[0].user._id)
											?.online
											? "online"
											: "offline"
									}
								/>
								<p className={cn("truncate", channel.isMuted && "opacity-60")}>
									{`${filteredMembers[0].user.firstName} ${filteredMembers[0].user.lastName}`}
								</p>
							</div>
						) : (
							<div className="-space-x-4 flex items-center justify-center">
								{filteredMembers.map((member) => (
									<div key={member.user._id} className="inline-block">
										<Avatar className="size-7">
											<AvatarImage src={member.user.avatarUrl} />
											<AvatarFallback>{member.user.firstName[0]}</AvatarFallback>
										</Avatar>
									</div>
								))}
								<p className={cn("truncate", channel.isMuted && "opacity-60")}>
									{filteredMembers
										.map((member) => `${member.user.firstName} ${member.user.lastName}`)
										.join(", ")}
								</p>
							</div>
						)}
					</div>
					{channel.currentUser.notificationCount > 0 && (
						<div className="-translate-y-1/2 absolute top-1/2 right-1 flex h-2.5 items-center justify-center rounded-lg border bg-muted p-2 text-xs transition-all duration-200 group-focus-within/menu-item:right-6 group-hover/menu-action:right-6 group-hover/menu-item:right-6 group-data-[state=open]/menu-action:right-6 [&:has(+[data-sidebar=menu-action][data-state=open])]:right-6">
							{channel.currentUser.notificationCount}
						</div>
					)}
				</Link>
			</SidebarMenuButton>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuAction
						showOnHover
						className="rounded-sm text-foreground data-[state=open]:bg-muted"
					>
						<IconThreeDotsMenuHorizontalStroke className="text-foreground" />
						<span className="sr-only">More</span>
					</SidebarMenuAction>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => {
							console.log("TODO: Implement call")
						}}
					>
						<IconPhone2 className="size-4" />
						Call
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleToggleMute}>
						{channel.isMuted ? (
							<IconVolumeOne1 className="size-4" />
						) : (
							<IconVolumeMute1 className="size-4" />
						)}
						{channel.isMuted ? "Unmute" : "Mute"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleToggleFavorite}>
						{channel.isFavorite ? (
							<IconStar1 className="size-4 text-amber-500" />
						) : (
							<IconStar1 className="size-4" />
						)}
						{channel.isFavorite ? "Unfavorite" : "Favorite"}
					</DropdownMenuItem>
					<DropdownMenuItem className="text-destructive" onClick={handleClose}>
						<IconMultipleCrossCancelStroke className="size-4" />
						Close
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	)
}
