import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import type { Message } from "~/lib/hooks/data/use-chat-messages"
import { UserTag } from "../user-tag"

function getPlainTextFromContent(content: string): string {
	try {
		const parsed = JSON.parse(content)
		return extractTextFromJsonNodes(parsed.content || [])
	} catch {
		return content.replace(/<[^>]*>/g, "")
	}
}

function extractTextFromJsonNodes(nodes: any[]): string {
	if (!Array.isArray(nodes)) return ""
	return nodes
		.map(
			(node) =>
				(node.type === "text" && node.text) || (node.content && extractTextFromJsonNodes(node.content)) || "",
		)
		.join(" ")
}

interface MessageReplyProps {
	message: Message
	onReplyClick: (id: string) => void
}

export function MessageReply(props: MessageReplyProps) {
	return (
		<Button
			class="flex w-fit items-center gap-1 pl-12 text-left hover:bg-transparent"
			intent="ghost"
			onClick={() => {
				if (props.message.replyToMessageId) {
					props.onReplyClick(props.message.replyToMessageId)
				}
			}}
		>
			<Avatar
				class="size-4"
				name={props.message.replyToMessage?.author?.displayName!}
				src={props.message.replyToMessage?.author?.avatarUrl}
			/>
			<UserTag user={props.message.replyToMessage?.author!} />
			<span class="text-ellipsis text-foreground text-xs">
				{getPlainTextFromContent(props.message.replyToMessage?.content ?? "")}
			</span>
		</Button>
	)
}
