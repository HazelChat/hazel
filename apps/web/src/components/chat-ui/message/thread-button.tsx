import type { Doc } from "@hazel/backend"
import { type Accessor, For, Show, createMemo } from "solid-js"
import { useChat } from "~/components/chat-state/chat-store"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import type { Message } from "~/lib/types"

interface ThreadButtonProps {
	threadChannelId: string
	threadMessages: Message["threadMessages"]
}

export function ThreadButton(props: ThreadButtonProps) {
	const { setState } = useChat()

	const topFourAuthors = createMemo(() => {
		const authors: { displayName: string; avatarUrl: string }[] = []
		for (const message of props.threadMessages) {
			if (
				message.author?.avatarUrl &&
				!authors.some((a) => a.avatarUrl === message.author!.avatarUrl)
			) {
				authors.push({
					displayName: message.author.displayName!,
					avatarUrl: message.author.avatarUrl,
				})
			}
		}
		return { authors: authors.slice(0, 4), total: authors.length }
	})

	return (
		<Button
			intent="ghost"
			class="mt-1 flex w-full justify-start px-1"
			onClick={() => {
				setState("openThreadId", props.threadChannelId)
			}}
		>
			<For each={topFourAuthors().authors}>
				{(author) => <Avatar class="size-5" name={author.displayName!} src={author.avatarUrl} />}
			</For>
			<Show when={topFourAuthors().total > 4}>
				<span class="text-muted-foreground text-xs">+{topFourAuthors().total - 4}</span>
			</Show>
			<div class="ml-1 flex items-center gap-1">
				<p class="text-muted-foreground text-xs">{props.threadMessages.length} messages</p>
				<span class="mx-1 text-muted-foreground text-xs">&middot;</span>
				<p class="text-muted-foreground text-xs">
					Last message{" "}
					{new Date(props.threadMessages.at(-1)?._creationTime!).toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					})}
				</p>
			</div>
		</Button>
	)
}
