import type { MessageId } from "@hazel/db/schema"
import { useMessage } from "~/db/hooks"
import { Avatar } from "../base/avatar/avatar"

interface MessageReplySectionProps {
	replyToMessageId: MessageId
	onClick?: () => void
}

export function MessageReplySection({ replyToMessageId, onClick }: MessageReplySectionProps) {
	const { data, isLoading } = useMessage(replyToMessageId)

	return (
		<div className="relative">
			{/* Reply curve SVG */}
			<svg
				className="-bottom-1 absolute left-5 rotate-90 text-quaternary"
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
						<div className="size-4 animate-pulse rounded-full bg-quaternary" />
						<span className="text-secondary text-sm">Loading...</span>
					</>
				) : data ? (
					<>
						<Avatar
							size="xxs"
							alt={`${data.author.firstName} ${data.author.lastName}`}
							src={data.author.avatarUrl}
						/>
						<span className="text-secondary text-sm hover:underline">
							{data.author.firstName} {data.author.lastName}
						</span>
						<span className="max-w-xs truncate text-ellipsis text-foreground text-xs">
							{data.content.split("\n")[0]}
						</span>
					</>
				) : (
					<span className="text-secondary text-sm">Message not found</span>
				)}
			</button>
		</div>
	)
}
