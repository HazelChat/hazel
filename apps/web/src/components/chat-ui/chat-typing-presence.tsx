import { For, Show, createMemo } from "solid-js"
import { createTypingIndicator } from "~/lib/hooks/create-typing-indicator"
import { useChat } from "../chat-state/chat-store"

export const ChatTypingPresence = () => {
	const { state } = useChat()

	const inputText = createMemo(() => state.inputText)
	const channelId = createMemo(() => state.channelId)

	const { typingUsers } = createTypingIndicator(channelId, inputText)

	return (
		<div class="mb-2 h-3">
			<Show
				when={typingUsers().length < 3}
				fallback={
					<div class="flex items-center gap-2 text-muted-foreground text-xs">
						<div class="flex gap-1">
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted" />
						</div>

						<div class="flex items-center gap-1">
							<span class="font-medium">{typingUsers().length} users</span>
							<span>are typing</span>
						</div>
					</div>
				}
			>
				<For each={typingUsers()}>
					{(precense) => (
						<div class="flex items-center gap-2 text-muted-foreground text-xs">
							<div class="flex gap-1">
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted" />
							</div>

							<div class="flex items-center gap-1">
								<span class="font-medium">{precense.account.displayName}</span>
								<span>is typing</span>
							</div>
						</div>
					)}
				</For>
			</Show>
		</div>
	)
}
