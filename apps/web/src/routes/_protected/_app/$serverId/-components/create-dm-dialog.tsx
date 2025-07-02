import { useNavigate } from "@tanstack/solid-router"
import { type Accessor, For, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { IconPlusSmall } from "~/components/icons/plus-small"
import { Avatar } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Dialog } from "~/components/ui/dialog"

import { TextField } from "~/components/ui/text-field"

import type { Doc, Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { createMultiList } from "solid-list"
import { IconCheck } from "~/components/icons/check"
import { createMutation } from "~/lib/convex"
import { convexQuery } from "~/lib/convex-query"
import { cn } from "~/lib/utils"

export interface CreateDmDialogProps {
	serverId: Accessor<Id<"servers">>
}

export const CreateDmDialog = (props: CreateDmDialogProps) => {
	const friendsQuery = useQuery(() => convexQuery(api.social.getFriends, { serverId: props.serverId() }))

	const createChannelMutation = createMutation(api.channels.createChannel)
	const createDmChannelMutation = createMutation(api.channels.creatDmChannel)

	const [friendFilter, setFriendFilter] = createSignal<string>("")

	const [isDialogOpen, setDialogOpen] = createSignal(false)

	const navigate = useNavigate()

	const filteredFriends = createMemo(() => {
		const initalFriends = friendsQuery.data

		if (!initalFriends) return []

		if (friendFilter() === "") {
			return initalFriends
		}
		return initalFriends.filter(
			(friend) =>
				friend.displayName.toLowerCase().includes(friendFilter().toLowerCase()) ||
				friend.tag.includes(friendFilter().toLowerCase()),
		)
	})

	const [selectFriends, setSelectedFriends] = createSignal<Doc<"users">[]>([])

	const toggleSelected = (item: Doc<"users">) => {
		if (selectFriends().find((i) => i._id === item._id)) {
			setSelectedFriends((friends) => friends.filter((i) => i._id !== item._id))
		} else {
			setSelectedFriends((friends) => [...friends, item])
		}
	}

	const [refs, setRefs] = createSignal<HTMLDivElement[]>([])

	const { active, setActive, onKeyDown, cursor, setCursorActive } = createMultiList({
		items: () => filteredFriends(),
		orientation: "vertical",
		handleTab: true,
		vimMode: true,
		onCursorChange: (item) => {
			if (item === null) return
			refs()[filteredFriends().findIndex((i) => i._id === item._id)]?.focus()
		},
	})

	createEffect(() => {
		document.addEventListener("mousedown", onMouseDown)
		onCleanup(() => document.removeEventListener("mousedown", onMouseDown))
	})
	const onMouseDown = () => setCursorActive(null)

	return (
		<Dialog open={isDialogOpen()} onOpenChange={(details) => setDialogOpen(details.open)}>
			<Dialog.Trigger
				class="text-muted-foreground"
				asChild={(props) => (
					<Button intent="ghost" size="icon" {...props}>
						<IconPlusSmall />
					</Button>
				)}
			/>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Select friends</Dialog.Title>
					<Dialog.Description>
						You can add {10 - selectFriends().length} more friends to this DM.
					</Dialog.Description>
				</Dialog.Header>
				<div class="flex flex-col gap-2">
					<div class="flex w-full flex-wrap gap-2 overflow-hidden">
						<For each={selectFriends()}>{(friend) => <Badge>{friend.displayName}</Badge>}</For>
					</div>
					<TextField
						placeholder="Search friends"
						value={friendFilter()}
						onKeyDown={onKeyDown}
						onInput={(e) => {
							setFriendFilter(e.target.value)
						}}
					/>
					<div class="flex flex-col gap-2">
						<For each={filteredFriends()}>
							{(item) => (
								<div
									class={cn(
										"relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-highlighted:bg-accent data-[disabled]:opacity-50",
										{
											"bg-accent": active().includes(item),
										},
									)}
									ref={(ref) => setRefs((refs) => [...refs, ref])}
									role="checkbox"
									aria-checked={
										selectFriends().find((i) => i._id === item._id) !== undefined
									}
									tabindex="0"
									onFocus={() => {
										if (cursor() !== null) return
										setCursorActive(item)
									}}
									onKeyDown={(e) => {
										if (e.key === "x" || e.key === " " || e.key === "Enter") {
											toggleSelected(item)
											e.preventDefault()
											return
										}
										onKeyDown(e)
									}}
									onClick={() => {
										setCursorActive(item)
										toggleSelected(item)
									}}
								>
									<div class="flex items-center gap-3">
										<Avatar size="xs" src={item.avatarUrl} name={item.displayName} />
										<p class="font-normal text-base text-foreground leading-none tracking-tight">
											{item.displayName}
										</p>
									</div>

									<Show when={selectFriends().find((i) => i._id === item._id)}>
										<IconCheck class="size-3 text-primary" />
									</Show>
								</div>
							)}
						</For>
					</div>
				</div>
				<Dialog.Footer>
					<Button
						intent="default"
						onClick={async () => {
							let channelId: Id<"channels"> | undefined

							if (selectFriends().length === 1) {
								channelId = await createDmChannelMutation({
									serverId: props.serverId() as Id<"servers">,
									userId: selectFriends()[0]._id as Id<"users">,
								})
							} else {
								channelId = await createChannelMutation({
									serverId: props.serverId() as Id<"servers">,
									userIds: selectFriends().map((friend) => friend._id as Id<"users">),
									type: "direct",
									name: "Dm Channel",
								})
							}

							setDialogOpen(false)

							setSelectedFriends([])
							setFriendFilter("")

							navigate({
								to: "/$serverId/chat/$id" as const,
								params: { id: channelId, serverId: props.serverId() },
							})
						}}
					>
						Create DM
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog>
	)
}
