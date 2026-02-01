import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Message } from "@hazel/domain/models"
import type { ChannelId } from "@hazel/schema"
import { format } from "date-fns"
import { threadMessagesAtomFamily, userWithPresenceAtomFamily } from "~/atoms/message-atoms"
import { useAuth } from "~/lib/auth"
import { Avatar } from "../ui/avatar"
import { MessageContent } from "./message-content"

interface ThreadMessageListProps {
	threadChannelId: ChannelId
}

export function ThreadMessageList({ threadChannelId }: ThreadMessageListProps) {
	// Query thread messages using the atom (queries by channelId = threadChannelId)
	const messagesResult = useAtomValue(
		threadMessagesAtomFamily({ threadChannelId, maxPreviewMessages: 100 }),
	)
	const messages = Result.getOrElse(messagesResult, () => [])

	if (messages.length === 0) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<p className="text-muted-fg">No replies yet. Start the conversation!</p>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
			{messages.map((message) => (
				<ThreadMessage key={message.id} message={message} />
			))}
		</div>
	)
}

function ThreadMessage({ message }: { message: typeof Message.Model.Type }) {
	const userResult = useAtomValue(userWithPresenceAtomFamily(message.authorId))
	const userData = Result.getOrElse(userResult, () => [])
	const user = userData[0]?.user
	const { user: currentUser } = useAuth()

	// Adapt message to MessageWithPinned type (thread messages don't have pinned state)
	const messageWithPinned = {
		...message,
		author: user ?? null,
		pinnedMessage: null,
	}

	return (
		<div className="flex gap-3 rounded-lg px-2 py-2 hover:bg-secondary">
			<Avatar
				src={user?.avatarUrl}
				initials={user ? `${user.firstName} ${user.lastName}` : "?"}
				className="size-8"
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span className="font-medium text-fg text-sm">
						{user ? `${user.firstName} ${user.lastName}` : "Unknown"}
					</span>
					<span className="text-muted-fg text-xs">{format(message.createdAt, "HH:mm")}</span>
				</div>
				<div className="mt-0.5">
					<MessageContent.Provider
						message={messageWithPinned}
						organizationId={currentUser?.organizationId ?? undefined}
					>
						<MessageContent.Text />
						<MessageContent.Embeds />
					</MessageContent.Provider>
				</div>
			</div>
		</div>
	)
}
