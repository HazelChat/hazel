import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Message } from "@hazel/domain/models"
import type { ChannelId, MessageId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { format } from "date-fns"
import {
	threadMessageCountAtomFamily,
	threadMessagesAtomFamily,
	userWithPresenceAtomFamily,
} from "~/atoms/message-atoms"
import { channelCollection } from "~/db/collections"
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

	// Fetch thread name
	const { data: threadData } = useLiveQuery(
		(q) => q.from({ channel: channelCollection }).where((q) => eq(q.channel.id, threadChannelId)),
		[threadChannelId],
	)
	const threadName = threadData?.[0]?.name

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
		<div className="mt-2 rounded-lg border border-border bg-bg p-3">
			{/* Thread title header */}
			{threadName && threadName !== "Thread" && (
				<div className="mb-2 flex items-center gap-2 font-medium text-fg text-sm">
					<IconThread className="size-4 text-primary" />
					<span>{threadName}</span>
				</div>
			)}

			{/* Thread messages */}
			<div className="space-y-1">
				{previewMessages.map((message) => (
					<ThreadMessagePreview key={message.id} message={message} />
				))}
			</div>

			{/* View full thread button */}
			<Button
				intent="plain"
				size="sm"
				onPress={() => openThread(threadChannelId, messageId)}
				className="mt-2 flex items-center gap-2 text-primary hover:text-primary/80"
			>
				{/* Only show icon if no title header is displayed */}
				{!(threadName && threadName !== "Thread") && (
					<IconThread data-slot="icon" className="size-4" />
				)}
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
