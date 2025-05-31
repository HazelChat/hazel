import { For, Show } from "solid-js"
import { useChat } from "../chat-state/chat-store"

export const ChatTypingPresence = () => {
	const { state } = useChat()

	// TODO: Reimplement
	const { users } = { users: () => [] }

	return (
		<div class="mb-2 h-3">
			<Show
				when={users().length < 3}
				fallback={
					<div class="flex items-center gap-2 text-muted-foreground text-xs">
						<div class="flex gap-1">
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
							<div class="size-1.5 animate-bounce rounded-full bg-muted" />
						</div>

						<div class="flex items-center gap-1">
							<span class="font-medium">{users().length} users</span>
							<span>are typing</span>
						</div>
					</div>
				}
			>
				<For each={users()}>
					{(user) => (
						<div class="flex items-center gap-2 text-muted-foreground text-xs">
							<div class="flex gap-1">
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
								<div class="size-1.5 animate-bounce rounded-full bg-muted" />
							</div>

							<div class="flex items-center gap-1">
								<span class="font-medium">{user.displayName}</span>
								<span>is typing</span>
							</div>
						</div>
					)}
				</For>
			</Show>
		</div>
	)
}
