import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { type Accessor, createSignal, For, Suspense } from "solid-js"
import { twMerge } from "tailwind-merge"
import { useChat } from "~/components/chat-state/chat-store"
import { IconEmojiAdd } from "~/components/icons/emoji-add"
import { IconThreeDotsMenuHorizontalStroke } from "~/components/iconsv2"

import { Button, buttonVariants } from "~/components/ui/button"
import { Menu } from "~/components/ui/menu"
import { Popover } from "~/components/ui/popover"
import { Tooltip } from "~/components/ui/tooltip"
import { createMutation, optimisticAddReaction, optimisticRemoveReaction } from "~/lib/convex"
import { convexQuery } from "~/lib/convex-query"
import type { Message } from "~/lib/types"
import { ConfirmDialog } from "../confirm-dialog"
import { EmojiPicker } from "./emoji-picker"
import { createMessageActions } from "./message-actions-config"

interface MessageActionsProps {
	message: Accessor<Message>
	serverId: Accessor<string>
	isPinned: Accessor<boolean>
	isGroupStart: Accessor<boolean>
	isThread: Accessor<boolean>
}

export function MessageActions(props: MessageActionsProps) {
	const [open, setOpen] = createSignal(false)
	const [openPopover, setOpenPopover] = createSignal(false)
	const [pendingAction, setPendingAction] = createSignal<any>(null)

	const { state } = useChat()

	const meQuery = useQuery(() => convexQuery(api.me.getUser, { serverId: state.serverId }))

	const actions = createMessageActions({
		message: props.message,
		isPinned: props.isPinned,
		isThread: props.isThread,
	})

	const handleAction = (action: any) => {
		if (action.confirm) {
			setPendingAction(action)
		} else {
			action.onAction()
		}
	}

	const createReactionMutation = createMutation(api.messages.createReaction).withOptimisticUpdate(
		(store, args) => {
			const userId = meQuery.data?._id
			if (!userId) return
			optimisticAddReaction(store, {
				serverId: args.serverId as Id<"servers">,
				channelId: props.message().channelId as Id<"channels">,
				messageId: args.messageId as Id<"messages">,
				emoji: args.emoji,
				userId,
			})
		},
	)
	const deleteReactionMutation = createMutation(api.messages.deleteReaction).withOptimisticUpdate(
		(store, args) => {
			const userId = meQuery.data?._id
			if (!userId) return
			optimisticRemoveReaction(store, {
				serverId: args.serverId as Id<"servers">,
				channelId: props.message().channelId as Id<"channels">,
				messageId: args.id as Id<"messages">,
				emoji: args.emoji,
				userId,
			})
		},
	)

	async function toggleReaction(emoji: string) {
		if (!meQuery.data) return

		setOpenPopover(false)
		const alreadyReacted = props
			.message()
			.reactions.some((r) => r.userId === meQuery.data?._id && r.emoji === emoji)

		try {
			if (alreadyReacted) {
				await deleteReactionMutation({
					serverId: state.serverId,
					id: props.message()._id,
					emoji,
				})
			} else {
				await createReactionMutation({
					serverId: state.serverId,
					messageId: props.message()._id,
					emoji,
				})
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Failed to toggle reaction", err)
		}
	}

	return (
		<Suspense>
			<div
				class={twMerge(
					"-top-4 absolute right-4 z-20 rounded-md border bg-sidebar shadow-md group-hover:flex",
					props.isGroupStart() ? "-top-4" : "-top-6",
					open() || openPopover() ? "flex" : "hidden",
				)}
			>
				<Popover open={openPopover()} onOpenChange={(value) => setOpenPopover(value.open)} lazyMount>
					<Popover.Trigger>
						<Button intent="ghost" size="square">
							<IconEmojiAdd />
						</Button>
					</Popover.Trigger>

					<Popover.UnstyledContent>
						<EmojiPicker onSelect={toggleReaction} />
					</Popover.UnstyledContent>
				</Popover>
				<For each={actions().filter((a) => a.showButton)}>
					{(a) => (
						<Tooltip>
							<Tooltip.Trigger>
								<Button intent="ghost" size="square" onClick={() => handleAction(a)}>
									{a.icon}
								</Button>
								<Tooltip.Content>
									{a.label}
									{a.hotkey && <span class="ml-2 text-muted-fg text-xs">[{a.hotkey}]</span>}
								</Tooltip.Content>
							</Tooltip.Trigger>
						</Tooltip>
					)}
				</For>

				<Menu open={open()} onOpenChange={(value) => setOpen(value.open)} lazyMount>
					<Menu.Trigger class={twMerge(buttonVariants({ intent: "ghost", size: "square" }))}>
						<IconThreeDotsMenuHorizontalStroke class="size-4" />
					</Menu.Trigger>
					<Menu.Content class="z-20">
						<For each={actions().filter((a) => a.showMenu)}>
							{(a) => (
								<Menu.Item
									value={a.label}
									class={`flex justify-between ${a.isDanger ? "text-danger" : ""}`}
									onClick={() => handleAction(a)}
								>
									<span>{a.label}</span>
									{a.icon}
								</Menu.Item>
							)}
						</For>
					</Menu.Content>
				</Menu>
			</div>

			<ConfirmDialog
				lazyMount
				open={!!pendingAction()}
				title={pendingAction()?.label}
				message={pendingAction()?.confirmMessage || "Are you sure?"}
				onCancel={() => setPendingAction(null)}
				onConfirm={async () => {
					await pendingAction()?.onAction()
					setPendingAction(null)
				}}
			/>
		</Suspense>
	)
}
