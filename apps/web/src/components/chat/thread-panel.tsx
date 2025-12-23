import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId, MessageId, OrganizationId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { format } from "date-fns"
import { Exit } from "effect"
import { useState } from "react"
import { toast } from "sonner"
import { generateThreadNameMutation } from "~/atoms/channel-atoms"
import { channelCollection } from "~/db/collections"
import { useMessage } from "~/db/hooks"
import { ChatProvider } from "~/providers/chat-provider"
import IconClose from "../icons/icon-close"
import IconEdit from "../icons/icon-edit"
import IconPenSparkle from "../icons/icon-pen-sparkle"
import { RenameThreadModal } from "../modals/rename-thread-modal"
import { Avatar } from "../ui/avatar"
import { Button } from "../ui/button"
import { Loader } from "../ui/loader"
import { Tooltip, TooltipContent } from "../ui/tooltip"
import { SlateMessageComposer } from "./slate-editor/slate-message-composer"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"
import { ThreadMessageList } from "./thread-message-list"
import { TypingIndicator } from "./typing-indicator"

interface ThreadPanelProps {
	threadChannelId: ChannelId
	originalMessageId: MessageId
	organizationId: OrganizationId
	onClose: () => void
}

function ThreadContent({ threadChannelId, originalMessageId, onClose }: ThreadPanelProps) {
	const { data: originalMessage } = useMessage(originalMessageId)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)

	const generateName = useAtomSet(generateThreadNameMutation, { mode: "promiseExit" })

	const { data: threadData } = useLiveQuery(
		(q) => q.from({ channel: channelCollection }).where((q) => eq(q.channel.id, threadChannelId)),
		[threadChannelId],
	)

	const thread = threadData?.[0]
	const threadName = thread?.name || "Thread"

	const handleGenerateName = async () => {
		setIsGenerating(true)
		const exit = await generateName({ payload: { channelId: threadChannelId } })
		setIsGenerating(false)

		if (Exit.isFailure(exit)) {
			toast.error("Failed to generate thread name")
		}
	}

	return (
		<div className="flex h-full flex-col border-border border-l bg-bg">
			{/* Thread Header */}
			<div className="flex items-center justify-between border-border border-b bg-bg px-4 py-3">
				<div className="flex items-center gap-2">
					<h2 className="font-semibold text-fg">{threadName}</h2>
				</div>
				<div className="flex items-center gap-1">
					<Tooltip>
						<Button
							intent="plain"
							size="sq-sm"
							onPress={handleGenerateName}
							isDisabled={isGenerating}
							aria-label="Generate thread name"
							className="rounded p-1 hover:bg-secondary"
						>
							{isGenerating ? (
								<Loader className="size-4" />
							) : (
								<IconPenSparkle data-slot="icon" className="size-4" />
							)}
						</Button>
						<TooltipContent>Generate name</TooltipContent>
					</Tooltip>
					<Tooltip>
						<Button
							intent="plain"
							size="sq-sm"
							onPress={() => setIsRenameModalOpen(true)}
							aria-label="Rename thread"
							className="rounded p-1 hover:bg-secondary"
						>
							<IconEdit data-slot="icon" className="size-4" />
						</Button>
						<TooltipContent>Rename</TooltipContent>
					</Tooltip>
					<Button
						intent="plain"
						size="sq-sm"
						onPress={onClose}
						aria-label="Close thread"
						className="rounded p-1 hover:bg-secondary"
					>
						<IconClose data-slot="icon" className="size-4" />
					</Button>
				</div>
			</div>

			{/* Original Message */}
			{originalMessage && (
				<div className="border-border border-b bg-secondary px-4 py-3">
					<div className="flex gap-3">
						<Avatar
							src={originalMessage.author.avatarUrl}
							initials={`${originalMessage.author.firstName} ${originalMessage.author.lastName}`}
							className="size-9"
						/>
						<div className="min-w-0 flex-1">
							<div className="flex items-baseline gap-2">
								<span className="font-medium text-fg text-sm">
									{originalMessage.author.firstName} {originalMessage.author.lastName}
								</span>
								<span className="text-muted-fg text-xs">
									{format(originalMessage.createdAt, "MMM d, HH:mm")}
								</span>
							</div>
							<div className="mt-1">
								<SlateMessageViewer content={originalMessage.content} />
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Thread Messages */}
			<div className="flex-1 overflow-hidden bg-bg">
				<ThreadMessageList threadChannelId={threadChannelId} />
			</div>

			{/* Thread Composer */}
			<div className="border-border border-t bg-bg px-4 py-3">
				<SlateMessageComposer placeholder="Reply in thread..." />
				<TypingIndicator />
			</div>

			<RenameThreadModal
				threadId={threadChannelId}
				isOpen={isRenameModalOpen}
				onOpenChange={setIsRenameModalOpen}
			/>
		</div>
	)
}

export function ThreadPanel({
	threadChannelId,
	originalMessageId,
	onClose,
	organizationId,
}: ThreadPanelProps) {
	return (
		<ChatProvider channelId={threadChannelId} organizationId={organizationId}>
			<ThreadContent
				organizationId={organizationId}
				threadChannelId={threadChannelId}
				originalMessageId={originalMessageId}
				onClose={onClose}
			/>
		</ChatProvider>
	)
}
