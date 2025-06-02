import type { Doc } from "@hazel/backend"
import { useAuth } from "clerk-solidjs"
import { type Accessor, For, Show, createEffect, createMemo } from "solid-js"
import { createPresence } from "~/lib/convex-presence/create-presence"
import { createTypingIndicator } from "~/lib/convex-presence/create-typing-indicator"
import { useChat } from "../chat-state/chat-store"

export const ChatTypingPresence = () => {
	const { state } = useChat()

	const { userId, ...rest } = useAuth()

	const inputText = createMemo(() => state.inputText)

	const [data, others, updatePresence] = createPresence<{
		typing: boolean
		user: Doc<"users">
	}>(
		() => state.serverId,
		() => state.channelId,
		userId as Accessor<string>,
		{
			typing: false as boolean,
			user: undefined!,
		},
	)

	const isTyping = createMemo(() => data().typing)

	createTypingIndicator(isTyping, inputText, updatePresence)

	const presence = createMemo(() => {
		const res = others()
		if (!res) return []

		return res.filter((p) => p.data.typing)
	})

	return (
		<div class="mb-2 h-3">
			<Show
				when={presence().length < 3}
				fallback={
					<div class="flex items-center gap-2 text-muted-foreground text-xs">
						<div class="flex gap-1">
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted" />
						</div>

						<div class="flex items-center gap-1">
							<span class="font-medium">{presence().length} users</span>
							<span>are typing</span>
						</div>
					</div>
				}
			>
				<For each={presence()}>
					{(precense) => (
						<div class="flex items-center gap-2 text-muted-foreground text-xs">
							<div class="flex gap-1">
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted" />
							</div>

							<div class="flex items-center gap-1">
								<span class="font-medium">{precense.data.user.displayName}</span>
								<span>is typing</span>
							</div>
						</div>
					)}
				</For>
			</Show>
		</div>
	)
}
