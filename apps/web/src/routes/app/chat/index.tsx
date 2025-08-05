import { convexQuery } from "@convex-dev/react-query"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo } from "react"
import { Avatar } from "~/components/base/avatar/avatar"
import IconHashtagStroke from "~/components/icons/IconHashtagStroke"
import IconLockCloseStroke from "~/components/icons/IconLockCloseStroke"
import { usePresence } from "~/components/presence/presence-provider"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/app/chat/")({
	component: RouteComponent,
})

function RouteComponent() {
	const channelsQuery = useQuery(convexQuery(api.channels.getChannelsForOrganization, {}))
	const { data: me } = useQuery(convexQuery(api.me.getCurrentUser, {}))
	const { presenceList } = usePresence()

	const publicChannels = useMemo(
		() => channelsQuery.data?.organizationChannels?.filter((ch) => ch.type === "public") || [],
		[channelsQuery.data],
	)

	const privateChannels = useMemo(
		() => channelsQuery.data?.organizationChannels?.filter((ch) => ch.type === "private") || [],
		[channelsQuery.data],
	)

	const dmChannels = useMemo(
		() => channelsQuery.data?.dmChannels || [],
		[channelsQuery.data],
	)

	if (channelsQuery.isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading channels...</div>
			</div>
		)
	}

	return (
		<div className="h-screen overflow-auto bg-background">
			<div className="mx-auto max-w-6xl p-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">All Channels</h1>
					<p className="mt-2 text-muted-foreground">Browse and join conversations</p>
				</div>

				{publicChannels.length > 0 && (
					<div className="mb-8">
						<h2 className="mb-4 text-lg font-semibold">Public Channels</h2>
						<div className="grid gap-2">
							{publicChannels.map((channel) => (
								<ChannelCard key={channel._id} channel={channel} />
							))}
						</div>
					</div>
				)}

				{privateChannels.length > 0 && (
					<div className="mb-8">
						<h2 className="mb-4 text-lg font-semibold">Private Channels</h2>
						<div className="grid gap-2">
							{privateChannels.map((channel) => (
								<ChannelCard key={channel._id} channel={channel} isPrivate />
							))}
						</div>
					</div>
				)}

				{dmChannels.length > 0 && (
					<div className="mb-8">
						<h2 className="mb-4 text-lg font-semibold">Direct Messages</h2>
						<div className="grid gap-2">
							{dmChannels.map((channel) => (
								<DmCard
									key={channel._id}
									channel={channel}
									currentUserId={me?._id}
									presenceList={presenceList}
								/>
							))}
						</div>
					</div>
				)}

				{!publicChannels.length && !privateChannels.length && !dmChannels.length && (
					<div className="flex h-64 items-center justify-center">
						<p className="text-muted-foreground">No channels available</p>
					</div>
				)}
			</div>
		</div>
	)
}

function ChannelCard({ channel, isPrivate = false }: { channel: any; isPrivate?: boolean }) {
	return (
		<Link
			to="/app/chat/$id"
			params={{ id: channel._id }}
			className="group relative flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
				{isPrivate ? (
					<IconLockCloseStroke className="h-5 w-5 text-muted-foreground" />
				) : (
					<IconHashtagStroke className="h-5 w-5 text-muted-foreground" />
				)}
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<h3 className={cn("font-medium", channel.isMuted && "opacity-60")}>
						{channel.name}
					</h3>
					{channel.isFavorite && (
						<span className="text-amber-500">★</span>
					)}
				</div>
				{channel.description && (
					<p className="text-sm text-muted-foreground line-clamp-1">{channel.description}</p>
				)}
				<div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
					<span>{channel.members?.length || 0} members</span>
					{channel.isMuted && <span>Muted</span>}
				</div>
			</div>
			{channel.currentUser?.notificationCount > 0 && (
				<div className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
					{channel.currentUser.notificationCount}
				</div>
			)}
		</Link>
	)
}

function DmCard({
	channel,
	currentUserId,
	presenceList,
}: {
	channel: any
	currentUserId?: string
	presenceList: any[]
}) {
	const otherMembers = channel.members.filter((member: any) => member.userId !== currentUserId)

	if (channel.type === "single" && otherMembers.length === 1) {
		const member = otherMembers[0]
		const isOnline = presenceList.find((p) => p.userId === member.user._id)?.online

		return (
			<Link
				to="/app/chat/$id"
				params={{ id: channel._id }}
				className="group relative flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
			>
				<Avatar
					size="md"
					src={member.user.avatarUrl}
					alt={`${member.user.firstName} ${member.user.lastName}`}
					status={isOnline ? "online" : "offline"}
				/>
				<div className="flex-1">
					<h3 className={cn("font-medium", channel.isMuted && "opacity-60")}>
						{member.user.firstName} {member.user.lastName}
					</h3>
					<p className="text-sm text-muted-foreground">
						{isOnline ? "Active now" : "Offline"}
					</p>
				</div>
				{channel.currentUser?.notificationCount > 0 && (
					<div className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
						{channel.currentUser.notificationCount}
					</div>
				)}
			</Link>
		)
	}

	return (
		<Link
			to="/app/chat/$id"
			params={{ id: channel._id }}
			className="group relative flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="-space-x-2 flex">
				{otherMembers.slice(0, 3).map((member: any) => (
					<Avatar
						key={member.user._id}
						className="size-10 border-2 border-background"
						src={member.user.avatarUrl}
						alt={member.user.firstName[0]}
					/>
				))}
			</div>
			<div className="flex-1">
				<h3 className={cn("font-medium", channel.isMuted && "opacity-60")}>
					{otherMembers
						.map((member: any) => `${member.user.firstName} ${member.user.lastName}`)
						.join(", ")}
				</h3>
				<p className="text-sm text-muted-foreground">
					{otherMembers.length} participants
				</p>
			</div>
			{channel.currentUser?.notificationCount > 0 && (
				<div className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
					{channel.currentUser.notificationCount}
				</div>
			)}
		</Link>
	)
}