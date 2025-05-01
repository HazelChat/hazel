import { createFileRoute } from "@tanstack/solid-router"
import { For, Show, createMemo } from "solid-js"
import { twMerge } from "tailwind-merge"
import { tv } from "tailwind-variants"
import { ChatImage } from "~/components/chat-ui/chat-image"
import { ChatTopbar } from "~/components/chat-ui/chat-topbar"
import { ReactionTags } from "~/components/chat-ui/reaction-tags"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useChatMessages, type Message } from "~/lib/hooks/data/use-chat-messages"
import { useZero } from "~/lib/zero-context"

export const Route = createFileRoute("/_app/$serverId/chat/$id")({
	component: RouteComponent,
})


function RouteComponent() {
	const params = Route.useParams()()

	const { messages } = useChatMessages(params.id)
	const processedMessages = createMemo(() => {
		const groupedMessages = messages().reduce<Record<string, Message[]>>((groups, message) => {
			const date = new Date(message.createdAt!).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})

			if (!groups[date]) {
				groups[date] = [] as any
			}
			groups[date].push(message)
			return groups
		}, {})

		const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
			return new Date(a).getTime() - new Date(b).getTime()
		})

		const timeThreshold = 5 * 60 * 1000 // 5 minutes

		const processedGroupedMessages: Record<
			string,
			Array<{ message: Message; isGroupStart: boolean; isGroupEnd: boolean }>
		> = {}

		for (const date of sortedDates) {
			const messagesForDate = groupedMessages[date].reverse() // Still reversed
			const processedMessages = []

			for (let i = 0; i < messagesForDate.length; i++) {
				const currentMessage = messagesForDate[i]
				const prevMessage = i > 0 ? messagesForDate[i - 1] : null
				const nextMessage = i < messagesForDate.length - 1 ? messagesForDate[i + 1] : null

				// Determine if this message starts a new group
				let isGroupStart = true
				if (prevMessage) {
					const currentTime = new Date(currentMessage.createdAt!).getTime()
					const prevTime = new Date(prevMessage.createdAt!).getTime()
					const timeDiff = currentTime - prevTime
					if (currentMessage.authorId === prevMessage.authorId && timeDiff < timeThreshold) {
						isGroupStart = false
					}
				}

				// Determine if this message ends a group
				let isGroupEnd = true
				if (nextMessage) {
					const currentTime = new Date(currentMessage.createdAt!).getTime()
					const nextTime = new Date(nextMessage.createdAt!).getTime()
					const timeDiff = nextTime - currentTime
					if (currentMessage.authorId === nextMessage.authorId && timeDiff < timeThreshold) {
						isGroupEnd = false
					}
				}

				processedMessages.push({ message: currentMessage, isGroupStart, isGroupEnd })
			}
			processedGroupedMessages[date] = processedMessages
		}

		return { processedGroupedMessages }
	})

	return <div>
		<ChatTopbar />
		<div class="flex-1 space-y-6 overflow-y-auto p-4 pl-0">
			<For each={Object.entries(processedMessages().processedGroupedMessages)}>
				{([date, messages], dateIndex) => <div class="flex flex-col">
					<div class="py-2 text-center text-muted-fg text-sm">
						<span>{date}</span>
					</div>

					{messages.map(({ message, isGroupStart, isGroupEnd }, messageIndex) => {
						const isLastMessage =
							dateIndex() === Object.keys(processedMessages().processedGroupedMessages).length - 1 &&
							messageIndex === messages.length - 1

						return (
							<ChatMessage
								message={message}
								isLastMessage={isLastMessage}
								isGroupStart={isGroupStart}
								isGroupEnd={isGroupEnd}
							/>
						)
					})}
				</div>}
			</For>
		</div>
	</div>
}

function ChatMessage(props: { message: Message, isLastMessage: boolean, isGroupStart: boolean, isGroupEnd: boolean }) {
	const z = useZero()
	const showAvatar = props.isGroupStart

	const messageTime = createMemo(() => {
		return new Date(props.message.createdAt!).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
	})

	const attachedCount = createMemo(() => {
		return props.message.attachedFiles?.length ?? 0
	})

	const itemClass = createMemo(() => twMerge(
		"relative overflow-hidden rounded-md",
		attachedCount() === 1 ? "max-h-[300px]" : attachedCount() === 2 ? "aspect-video" : "aspect-square",
	))

	return <div class={chatMessageStyles({
		isGettingRepliedTo: false,
		isGroupStart: props.isGroupStart,
		isGroupEnd: props.isGroupEnd,
	})}>
		<div class="flex gap-4">
			<Show when={showAvatar}>
				<Avatar>
					<AvatarImage src={props.message.author?.avatarUrl} />
					<AvatarFallback>
						{props.message.author?.displayName.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
			</Show>
			<Show when={!showAvatar}>
				<div class="w-10 items-center justify-end pr-1 text-[10px] text-muted-fg leading-tight opacity-0 group-hover:opacity-100">
					{messageTime()}
				</div>
			</Show>
			<div class="min-w-0 flex-1">
				<Show when={showAvatar}>
					<div class="flex items-baseline gap-2">
						<span class="font-semibold">{props.message.author?.displayName}</span>
						<span class="text-muted-fg text-xs">{messageTime()}</span>
					</div>
				</Show>
				{/* TODO: This should be a markdown viewer */}
				<p class="text-sm">{props.message.content}</p>
				<div class="flex flex-col gap-2 pt-2">
					<Show when={attachedCount() > 0}>
						<div class={twMerge(
							"mt-2",
							attachedCount() === 1
								? "flex max-w-[400px]"
								: `grid grid-cols-${attachedCount() === 3 ? 3 : 2} max-w-lg`,
							"gap-1",
						)}
						>
							{props.message.attachedFiles?.slice(0, 4).map((file) => (
								<div class={itemClass()}>
									<ChatImage src={`${import.meta.env.VITE_BUCKET_URL}/${file}`} alt={file} />
								</div>
							))}
						</div>
					</Show>
					<ReactionTags message={props.message} />
				</div>
			</div>
		</div>
	</div>
}

export const chatMessageStyles = tv({
	base: "group relative flex flex-col px-4 py-1 transition-colors hover:bg-muted/50",
	variants: {
		variant: {
			chat: "rounded-l-none",
			pinned: "border p-3",
		},
		isGettingRepliedTo: {
			true: "border-primary border-l-2 bg-primary/20 hover:bg-primary/15",
			false: "",
		},
		isGroupStart: {
			true: "mt-2",
			false: "",
		},
		isGroupEnd: {
			true: "mb-2",
			false: "",
		},
	},
	defaultVariants: {
		variant: "chat",
	},
})
