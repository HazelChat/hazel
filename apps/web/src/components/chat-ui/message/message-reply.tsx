import type { Message } from "@maki-chat/api-schema/schema/message.js"
import { Markdown } from "@maki-chat/markdown"
import { Option } from "effect"
import { type Accessor, createMemo } from "solid-js"
import { twJoin } from "tailwind-merge"
import { useChat } from "~/components/chat-state/chat-store"
import { IconCode } from "~/components/icons/code"
import { IconImage } from "~/components/icons/image"
import { IconQuote } from "~/components/icons/quote"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useUser } from "~/lib/hooks/data/use-user"
import { MessageQueries } from "~/lib/services/data-access/message-queries"
import { UserTag } from "../user-tag"

interface MessageReplyProps {
	message: Accessor<Message>
	onReplyClick: (id: string) => void
}

export function MessageReply(props: MessageReplyProps) {
	// TODO: Fetch replytomessage here and author
	const { state } = useChat()

	const replyToMessageId = createMemo(() => Option.getOrThrow(props.message().replyToMessageId))
	const { data: replyToMessage } = MessageQueries.createMessageQuery({
		messageId: replyToMessageId,
		channelId: () => state.channelId,
	})

	const { user: replyToMessageAuthor } = useUser(() => replyToMessage?.authorId!)

	return (
		<div>
			<svg
				class="absolute top-2 left-8 rotate-180 text-muted"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
			>
				<path
					d="M12 2 L12 8 Q12 12 8 12 L2 12"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					fill="none"
				/>
			</svg>

			<Button
				class="flex w-fit items-center gap-1 pl-12 text-left hover:bg-transparent"
				intent="ghost"
				onClick={() => {
					const replyToMessageId = props.message().replyToMessageId
					if (Option.isSome(replyToMessageId)) {
						props.onReplyClick(replyToMessageId.value)
					}
				}}
			>
				<Avatar
					class="size-4"
					name={replyToMessageAuthor()?.displayName!}
					src={replyToMessageAuthor()?.avatarUrl}
				/>
				<UserTag user={replyToMessageAuthor()} />
				<span class="text-ellipsis text-foreground text-xs">
					<Markdown
						children={replyToMessage?.content.split("\n")[0]}
						components={{
							a: (props) => (
								<a
									class={twJoin([
										"outline-0 outline-offset-2 transition-[color,_opacity] focus-visible:outline-2 focus-visible:outline-ring forced-colors:outline-[Highlight]",
										"disabled:cursor-default disabled:opacity-60 forced-colors:disabled:text-[GrayText]",
										"text-primary hover:underline",
									])}
									{...props}
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							p: (props) => <span class="">{props.children}</span>,
							h1: (props) => <span class="font-bold">{props.children}</span>,
							blockquote: (props) => <IconQuote class="inline-flex text-muted-foreground" />,
							pre: (props) => <IconCode class="inline-flex text-muted-foreground" />,
							img: (parentProps) => {
								return <IconImage class="inline-flex text-muted-foreground" />
							},
						}}
						renderingStrategy="memo"
					/>
				</span>
			</Button>
		</div>
	)
}
