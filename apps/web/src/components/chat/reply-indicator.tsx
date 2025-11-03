import type { MessageId } from "@hazel/db/schema"
import { useMessage } from "~/db/hooks"
import { cn } from "~/lib/utils"
import IconClose from "../icons/icon-close"
import { Button } from "../ui/button"

interface ReplyIndicatorProps {
	className?: string
	replyToMessageId: MessageId
	onClose: () => void
}

export function ReplyIndicator({ className, replyToMessageId, onClose }: ReplyIndicatorProps) {
	const { data, isLoading } = useMessage(replyToMessageId)

	if (isLoading) {
		return (
			<div
				className={cn(
					"flex items-center justify-between gap-2 rounded-t-lg border border-border border-b-0 bg-secondary px-3 py-2",
					className,
				)}
			>
				<div className="flex items-center gap-2 text-sm">
					<div className="flex animate-pulse items-center gap-2">
						<div className="h-4 w-16 rounded bg-muted" />
						<div className="h-4 w-24 rounded bg-muted" />
						<div className="h-4 w-32 rounded bg-muted" />
					</div>
				</div>
				<div className="!p-1">
					<div className="size-3.5" />
				</div>
			</div>
		)
	}

	if (!data) {
		return null
	}

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-2 rounded-t-lg border border-border border-b-0 bg-secondary px-3 py-2",
				className,
			)}
		>
			<div className="flex items-center gap-2 text-sm">
				<span className="text-muted-fg">Replying to</span>
				<span className="font-semibold text-fg">
					{data.author.firstName} {data.author.lastName}
				</span>
				<span className="max-w-xs truncate text-muted-fg">{data.content.split("\n")[0]}</span>
			</div>
			<Button size="sq-xs" intent="plain" onPress={onClose} aria-label="Cancel reply" className="!p-1">
				<IconClose data-slot="icon" className="size-3.5" />
			</Button>
		</div>
	)
}
