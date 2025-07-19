import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import type { FunctionReturnType } from "convex/server"
import { type Accessor, createMemo, For, Index, Match, Switch } from "solid-js"
import { usePresenceState } from "~/lib/convex-presence"
import { convexQuery } from "~/lib/convex-query"
import { cn } from "~/lib/utils"
import { IconHashtag } from "../icons/hashtag"
import { Command } from "../ui/command-menu"
import { UserAvatar } from "../ui/user-avatar"
import { setCommandBarState } from "./command-bar"

export const ChannelBar = () => {
	const navigate = useNavigate()

	const serverQuery = useQuery(() => convexQuery(api.servers.getCurrentServer, {}))
	const serverId = createMemo(() => serverQuery.data?._id as Id<"servers">)

	const channelQuery = useQuery(() =>
		convexQuery(api.channels.getChannels, {
			serverId: serverId(),
			favoriteFilter: {
				favorite: false,
			},
		}),
	)
	const favoriteChannelsQuery = useQuery(() =>
		convexQuery(api.channels.getChannels, {
			serverId: serverId(),
			favoriteFilter: {
				favorite: true,
			},
		}),
	)

	return (
		<>
			<Command.Group heading="Favorites">
				<For each={favoriteChannelsQuery.data?.serverChannels}>
					{(channel) => (
						<Command.Item
							class="flex items-center gap-2"
							onSelect={() => {
								navigate({
									to: "/app/chat/$id",
									params: { id: channel._id },
								})
								setCommandBarState("open", false)
							}}
						>
							<IconHashtag class="size-4" />
							{channel.name}
						</Command.Item>
					)}
				</For>
				<For each={favoriteChannelsQuery.data?.dmChannels}>
					{(channel) => <DmChannelItem channel={() => channel} serverId={serverId} />}
				</For>
			</Command.Group>
			<Command.Group heading="Channels">
				<For each={channelQuery.data?.serverChannels}>
					{(channel) => (
						<Command.Item
							class="flex items-center gap-2"
							onSelect={() => {
								navigate({
									to: "/app/chat/$id",
									params: { id: channel._id },
								})
								setCommandBarState("open", false)
							}}
						>
							<IconHashtag class="size-4" />
							{channel.name}
						</Command.Item>
					)}
				</For>
			</Command.Group>
			<Command.Group heading="Direct Messages">
				<For each={channelQuery.data?.dmChannels}>
					{(channel) => <DmChannelItem channel={() => channel} serverId={serverId} />}
				</For>
			</Command.Group>
		</>
	)
}

interface DmChannelItemProps {
	channel: Accessor<FunctionReturnType<typeof api.channels.getChannels>["dmChannels"][0]>
	serverId: Accessor<Id<"servers">>
}

const DmChannelItem = (props: DmChannelItemProps) => {
	const navigate = useNavigate()
	const meQuery = useQuery(() => ({
		...convexQuery(api.me.getUser, { serverId: props.serverId() }),
	}))

	const filteredMembers = createMemo(() =>
		props.channel().members.filter((member) => member.userId !== meQuery.data?._id),
	)

	const presenceState = usePresenceState()

	return (
		<Command.Item
			onSelect={() => {
				navigate({
					to: "/app/chat/$id",
					params: { id: props.channel()._id },
				})
				setCommandBarState("open", false)
			}}
		>
			<div class="-space-x-4 flex items-center justify-center">
				<Switch>
					<Match when={props.channel().type === "single" && filteredMembers().length === 1}>
						<div class="flex items-center justify-center gap-3">
							<UserAvatar
								avatarUrl={filteredMembers()[0].user.avatarUrl}
								displayName={filteredMembers()[0].user.displayName}
								status={
									presenceState
										.presenceList()
										.find((p) => p.userId === filteredMembers()[0].user._id)?.online
										? "online"
										: "offline"
								}
							/>
							<p class={cn("truncate", props.channel().isMuted && "opacity-60")}>
								{filteredMembers()[0].user.displayName}
							</p>
						</div>
					</Match>
					<Match when={true}>
						<div class="-space-x-4 flex items-center justify-center">
							<Index each={filteredMembers()}>
								{(member) => (
									<div class="inline-block">
										<UserAvatar
											avatarUrl={member().user.avatarUrl}
											displayName={member().user.displayName}
											status={
												presenceState
													.presenceList()
													.find((p) => p.userId === member().user._id)?.online
													? "online"
													: "offline"
											}
										/>
									</div>
								)}
							</Index>
							<p class={cn("truncate", props.channel().isMuted && "opacity-60")}>
								{filteredMembers()
									.map((member) => member.user.displayName)
									.join(", ")}
							</p>
						</div>
					</Match>
				</Switch>
			</div>
		</Command.Item>
	)
}
