import type { Doc } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { type Accessor, createMemo } from "solid-js"
import { useChat } from "~/components/chat-state/chat-store"

import { IconBrandLinear } from "~/components/icons/brand/linear"
import { IconCopy } from "~/components/icons/copy"
import { IconPin } from "~/components/icons/pin"
import { IconPlus } from "~/components/icons/plus"
import { IconReply } from "~/components/icons/reply"
import { IconThread } from "~/components/icons/thread"
import { IconTrash } from "~/components/icons/trash"

import type { Id } from "@hazel/backend"
import { useAuth } from "clerk-solidjs"
import { createMutation } from "~/lib/convex"
import type { Message } from "~/lib/types"
import { EmojiPicker } from "./emoji-picker"

interface CreateMessageActionsProps {
	message: Accessor<Message>
	isThread: boolean
	isPinned: Accessor<boolean>
}

export function createMessageActions(props: CreateMessageActionsProps) {
	const { setState, state } = useChat()

	const channelId = createMemo(() => state.channelId)

	const deleteMessageMutation = createMutation(api.messages.deleteMessage)

	const pinMessageMutation = createMutation(api.pinnedMessages.createPinnedMessage)
	const unpinMessageMutation = createMutation(api.pinnedMessages.deletePinnedMessage)

	const createThreadMutation = createMutation(api.channels.createChannel)

	const { userId } = useAuth()

	const createReactionMutation = createMutation(api.messages.createReaction)
	const deleteReactionMutation = createMutation(api.messages.deleteReaction)

	async function toggleReaction(emoji: string) {
		const alreadyReacted = props
			.message()
			.reactions.some((r) => r.userId === userId() && r.emoji === emoji)

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
					userId: userId()! as Id<"users">,
					emoji,
				})
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Failed to toggle reaction", err)
		}
	}

	return createMemo(() => [
		{
			key: "add-reaction",
			label: "Add Reaction",
			icon: <IconPlus />,
			onAction: () => {},
			hotkey: "r",
			showButton: true,
			popoverContent: (
				<div class="py-2">
					<EmojiPicker onSelect={toggleReaction} />
				</div>
			),
		},
		{
			key: "thread",
			label: "Thread",
			icon: <IconThread class="size-4" />,
			onAction: async () => {
				let threadChannelId = props.message().threadChannelId || null

				if (!threadChannelId) {
					threadChannelId = await createThreadMutation({
						serverId: state.serverId,
						name: "Thread name should be generated with AI",
						parentChannelId: props.message().channelId,
						type: "thread",
						threadMessageId: props.message()._id,
					})
				}

				setState("openThreadId", threadChannelId)
			},
			hotkey: "t",
			showButton: !props.isThread && !(props.message().threadMessages?.length > 0),
		},
		{
			key: "reply",
			label: "Reply",
			icon: <IconReply class="size-4" />,
			onAction: () => {
				setState("replyToMessageId", props.message()._id)
			},
			hotkey: "shift+r",
			showButton: true,
		},
		{
			key: "create-issue",
			label: "Create Issue",
			icon: <IconBrandLinear class="size-4" />,
			onAction: () => {},
			hotkey: "i",
			showMenu: true,
		},
		{
			key: "pin",
			label: props.isPinned() ? "Unpin" : "Pin",
			icon: <IconPin class="size-4" />,
			onAction: async () => {
				if (props.isPinned()) {
					await unpinMessageMutation({
						messageId: props.message()._id,
						channelId: channelId(),
						serverId: state.serverId,
					})
					return
				}

				await pinMessageMutation({
					messageId: props.message()._id,
					channelId: channelId(),
					serverId: state.serverId,
				})
			},
			hotkey: "p",
			showMenu: true,
		},
		{
			key: "copy-text",
			label: "Copy Text",
			icon: <IconCopy class="size-4" />,
			onAction: () => navigator.clipboard.writeText(props.message().content),
			hotkey: "c",
			showMenu: true,
		},
		{
			key: "delete",
			label: "Delete",
			icon: <IconTrash class="size-4" />,
			onAction: async () =>
				deleteMessageMutation({
					id: props.message()._id,
					serverId: state.serverId,
				}),
			hotkey: "del",
			showMenu: true,
			isDanger: true,
			confirm: true,
			confirmMessage: "Are you sure you want to delete this message?",
		},
	])
}
