import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Message } from "@hazel/domain/models"
import type { ChannelId, MessageId } from "@hazel/schema"
import { format } from "date-fns"
import {
	threadMessageCountAtomFamily,
	threadMessagesAtomFamily,
	userWithPresenceAtomFamily,
} from "~/atoms/message-atoms"
import { useChat } from "~/hooks/use-chat"
import IconThread from "../icons/icon-thread"
import { Avatar } from "../ui/avatar"
import { Button } from "../ui/button"

interface InlineThreadPreviewProps {
	threadChannelId: ChannelId
	messageId: MessageId
	maxPreviewMessages?: number
}

export function InlineThreadPreview({
	threadChannelId,
	messageId,
	maxPreviewMessages = 1,
}: InlineThreadPreviewProps) {
	const { openThread } = useChat()

	// Use atoms for thread messages - automatically deduplicated across all thread previews
	const threadMessagesResult = useAtomValue(
		threadMessagesAtomFamily({ threadChannelId, maxPreviewMessages }),
	)
	const threadMessages = Result.getOrElse(threadMessagesResult, () => [])

	// Get total thread message count using atom
	const countResult = useAtomValue(threadMessageCountAtomFamily(threadChannelId))
	const countData = Result.getOrElse(countResult, () => [])

	const totalCount = countData?.[0]?.count ?? 0
	const previewMessages = threadMessages?.slice(0, maxPreviewMessages) ?? []
	const hasMoreMessages = totalCount > maxPreviewMessages

	if (!previewMessages || previewMessages.length === 0) {
		return null
	}

	return (
		<div className="mt-2">
			{/* Thread container with visual connection */}
			<div className="relative">
				{/* Vertical line connecting to parent message */}
				<div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

				{/* Thread messages */}
				<div className="space-y-1 pl-8">
					{previewMessages.map((message) => (
						<ThreadMessagePreview key={message.id} message={message} />
					))}
				</div>
			</div>

			{/* View full thread button */}
			<Button
				intent="plain"
				size="sm"
				onPress={() => openThread(threadChannelId, messageId)}
				className="mt-2 ml-8 flex items-center gap-2 text-primary hover:text-primary/80"
			>
				<IconThread data-slot="icon" className="size-4" />
				<span className="font-medium">
					{hasMoreMessages
						? `View all ${totalCount} ${totalCount === 1 ? "reply" : "replies"}`
						: `${totalCount} ${totalCount === 1 ? "reply" : "replies"}`}
				</span>
			</Button>
		</div>
	)
}

function ThreadMessagePreview({ message }: { message: typeof Message.Model.Type }) {
	// Use atom for user data - automatically deduplicated across all thread messages
	const userPresenceResult = useAtomValue(userWithPresenceAtomFamily(message.authorId))
	const data = Result.getOrElse(userPresenceResult, () => [])
	const result = data[0]
	const user = result?.user

	if (!user) return null

	return (
		<div className="group flex gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/50">
			<Avatar src={user.avatarUrl} initials={`${user.firstName} ${user.lastName}`} className="size-6" />

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span className="font-medium text-sm">
						{user.firstName} {user.lastName}
					</span>
					<span className="text-muted-fg text-xs">{format(message.createdAt, "HH:mm")}</span>
				</div>
				<p className="text-base text-fg leading-snug">{message.content}</p>
			</div>
		</div>
	)
}
