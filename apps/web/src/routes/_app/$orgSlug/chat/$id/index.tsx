import { createFileRoute } from "@tanstack/react-router"
import { useRef } from "react"
import { MessageList, type MessageListRef } from "~/components/chat/message-list"
import { SlateMessageComposer } from "~/components/chat/slate-editor/slate-message-composer"
import { TypingIndicator } from "~/components/chat/typing-indicator"

export const Route = createFileRoute("/_app/$orgSlug/chat/$id/")({
	component: MessagesRoute,
})

function MessagesRoute() {
	const messageListRef = useRef<MessageListRef>(null)

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<MessageList ref={messageListRef} />
			</div>
			<div className="shrink-0 px-4 pt-2.5">
				<SlateMessageComposer />
				<TypingIndicator />
			</div>
		</>
	)
}
