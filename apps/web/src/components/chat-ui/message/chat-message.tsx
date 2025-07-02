import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { type Accessor, createEffect, createMemo, ErrorBoundary, Show, Suspense } from "solid-js"
import { useChat } from "~/components/chat-state/chat-store"
import { Badge } from "~/components/ui/badge"
import { createMutation } from "~/lib/convex"
import type { Message } from "~/lib/types"
import { MessageActions } from "./message-actions"
import { MessageContent } from "./message-content"
import { MessageHeader } from "./message-header"
import { MessageReply } from "./message-reply"
import { chatMessageStyles } from "./message-styles"

interface ChatMessageProps {
	serverId: Accessor<Id<"servers">>
	message: Accessor<Message>
	isGroupStart: Accessor<boolean>
	isGroupEnd: Accessor<boolean>
	isFirstNewMessage: Accessor<boolean>
	isThread: Accessor<boolean>
}

export function ChatMessage(props: ChatMessageProps) {
	const isRepliedTo = createMemo(() => !!props.message().replyToMessageId)
	const showAvatar = createMemo(() => props.isGroupStart() || isRepliedTo())

	const { state } = useChat()

	const messageId = createMemo(() => props.message()._id)

	const isPinned = () =>
		state.channel?.pinnedMessages.find((m) => m.messageId === messageId()) !== undefined

	const setNotificationAsRead = createMutation(api.notifications.setNotifcationAsRead)

	const scrollToMessage = (id: string) => {
		const el = document.getElementById(`message-${id}`)
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" })
			el.classList.add("bg-primary/20")
			setTimeout(() => el.classList.remove("bg-primary/20"), 1500)
		}
	}

	createEffect(async () => {
		if (props.isFirstNewMessage()) {
			await setNotificationAsRead({
				channelId: props.message().channelId!,
				serverId: props.serverId(),
			})
		}
	})

	return (
		<div
			id={`message-${props.message()._id}`}
			class={chatMessageStyles({
				isGettingRepliedTo: false,
				isGroupStart: props.isGroupStart(),
				isGroupEnd: props.isGroupEnd(),
				isFirstNewMessage: props.isFirstNewMessage(),
				isPinned: isPinned(),
				class: "rounded-l-none",
			})}
			data-id={props.message()._id}
		>
			<Show when={props.isFirstNewMessage()}>
				<div class="absolute top-1 right-1 z-10">
					<Badge class="text-[10px]">New Message</Badge>
				</div>
			</Show>

			<Show when={isRepliedTo()}>
				<MessageReply message={props.message} onReplyClick={scrollToMessage} />
			</Show>

			<div class="flex gap-4">
				<Suspense>
					<MessageActions
						message={props.message}
						serverId={props.serverId}
						isGroupStart={props.isGroupStart}
						isPinned={isPinned}
						isThread={props.isThread}
					/>
				</Suspense>

				<MessageHeader message={props.message} showAvatar={showAvatar} serverId={props.serverId} />
				<MessageContent message={props.message} serverId={props.serverId} showAvatar={showAvatar} />
			</div>
		</div>
	)
}
