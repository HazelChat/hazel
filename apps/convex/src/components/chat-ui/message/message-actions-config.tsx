import { ChannelId } from "@maki-chat/api-schema/schema/message.js"
import { api } from "convex-hazel/_generated/api"
import type { Doc } from "convex-hazel/_generated/dataModel"
import { Option } from "effect"
import { type Accessor, createMemo } from "solid-js"
import { useChat } from "~/components/chat-state/chat-store"

import { IconBrandLinear } from "~/components/icons/brand/linear"
import { IconCopy } from "~/components/icons/copy"
import { IconPin } from "~/components/icons/pin"
import { IconPlus } from "~/components/icons/plus"
import { IconReply } from "~/components/icons/reply"
import { IconThread } from "~/components/icons/thread"
import { IconTrash } from "~/components/icons/trash"

import { createMutation } from "~/lib/convex"

interface CreateMessageActionsProps {
	message: Accessor<Doc<"messages">>
	isPinned: Accessor<boolean>
	isThread: Accessor<boolean>
}

export function createMessageActions(props: CreateMessageActionsProps) {
	const { setState, state } = useChat()

	const channelId = createMemo(() => state.channelId)

	const deleteMessageMutation = createMutation(api.messages.deleteMessage)

	const pinMessageMutation = createMutation(api.pinnedMessages.createPinnedMessage)
	const unpinMessageMutation = createMutation(api.pinnedMessages.deletePinnedMessage)

	const createThreadMutation = createMutation(api.channels.createChannel)

	return createMemo(() => [
		{
			key: "add-reaction",
			label: "Add Reaction",
			icon: <IconPlus />,
			onAction: () => {},
			hotkey: "r",
			showButton: true,
			popoverContent: <div class="py-3">{/* Emoji picker content */}</div>,
		},
		{
			key: "thread",
			label: "Thread",
			icon: <IconThread class="size-4" />,
			onAction: async () => {
				const threadChannelId = props.message().threadChannelId || null

				if (!threadChannelId) {
					await createThreadMutation({
						serverId: state.serverId,
						name: "Thread name should be generated with AI",
						parentChannelId: props.message().channelId,
						type: "thread",
					})
				}

				setState("openThreadId", threadChannelId)
			},
			hotkey: "t",
			showButton: !props.isThread,
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
