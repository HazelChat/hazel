import { useParams } from "@tanstack/solid-router"
import { type Accessor, createMemo } from "solid-js"
import { useChat } from "~/components/chat-state/chat-store"

import { IconBrandLinear } from "~/components/icons/brand/linear"
import { IconCopy } from "~/components/icons/copy"
import { IconPin } from "~/components/icons/pin"
import { IconPlus } from "~/components/icons/plus"
import { IconReply } from "~/components/icons/reply"
import { IconThread } from "~/components/icons/thread"
import { IconTrash } from "~/components/icons/trash"

import type { Message } from "~/lib/hooks/data/use-chat-messages"
import { newId } from "~/lib/id-helpers"
import { useZero } from "~/lib/zero/zero-context"

interface CreateMessageActionsProps {
	message: Accessor<Message>
	serverId: Accessor<string>
	isPinned: Accessor<boolean>
	isThread: boolean
}

export function createMessageActions(props: CreateMessageActionsProps) {
	const z = useZero()
	const params = useParams({ from: "/_app/$serverId/chat/$id" })()
	const { setState } = useChat()

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
				const threadChannelId = props.message().threadChannelId ?? newId("serverChannels")

				if (!props.message().threadChannelId) {
					await z.mutateBatch(async (tx) => {
						await tx.serverChannels.insert({
							id: threadChannelId,
							serverId: props.serverId(),
							name: `Thread ${props.message().author?.displayName}`,
							channelType: "thread",
							parentChannelId: props.message().channelId,
							createdAt: Date.now(),
						})

						await tx.messages.update({
							id: props.message().id,
							threadChannelId,
						})
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
				setState("replyToMessageId", props.message().id)
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
					await z.mutate.pinnedMessages.delete({
						id: props.message().pinnedInChannels?.find((p) => p.channelId === params.id)!.id,
					})
				} else {
					const id = newId("pinnedMessages")
					await z.mutate.pinnedMessages.insert({
						id,
						messageId: props.message().id,
						channelId: props.message().channelId!,
					})
				}
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
			onAction: async () => z.mutate.messages.delete({ id: props.message().id }),
			hotkey: "del",
			showMenu: true,
			isDanger: true,
			confirm: true,
			confirmMessage: "Are you sure you want to delete this message?",
		},
	])
}
