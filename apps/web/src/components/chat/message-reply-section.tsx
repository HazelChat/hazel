import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { MessageId } from "@hazel/schema"
import { messageWithAuthorAtomFamily } from "~/atoms/message-atoms"
import { Avatar } from "../ui/avatar"

interface MessageReplySectionProps {
	replyToMessageId: MessageId
	onClick?: () => void
}

export function MessageReplySection({ replyToMessageId, onClick }: MessageReplySectionProps) {
	// Use atom for message with author - automatically deduplicated
	const messageResult = useAtomValue(messageWithAuthorAtomFamily(replyToMessageId))
	const messages = Result.getOrElse(messageResult, () => [])
	const data = messages[0]
	const isLoading = Result.isInitial(messageResult)

	return (
		<div className="relative">
			{/* Reply curve SVG */}
			<svg
				className="-bottom-1 absolute left-5 rotate-90 text-muted-fg"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="20"
				viewBox="0 0 24 20"
				fill="none"
			>
				<path
					d="M2 2 L2 12 Q2 16 6 16 L12 16"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					fill="none"
				/>
			</svg>

			{/* Reply content */}
			<button
				type="button"
				className="flex w-fit items-center gap-1 pl-12 text-left hover:bg-transparent"
				onClick={onClick}
			>
				{isLoading ? (
					<>
						<div className="size-4 animate-pulse rounded-full bg-muted" />
						<span className="text-muted-fg text-sm">Loading...</span>
					</>
				) : data ? (
					<>
						<Avatar
							size="xs"
							src={data.author.avatarUrl}
							initials={`${data.author.firstName[0]}${data.author.lastName[0]}`}
							alt={`${data.author.firstName} ${data.author.lastName}`}
						/>
						<span className="font-medium text-fg text-sm hover:underline">
							{data.author.firstName} {data.author.lastName}
						</span>
						<span className="max-w-xs truncate text-ellipsis text-muted-fg text-sm">
							{data.content.split("\n")[0]}
						</span>
					</>
				) : (
					<span className="text-muted-fg text-sm">Message not found</span>
				)}
			</button>
		</div>
	)
}
