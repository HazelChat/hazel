import { Format } from "@ark-ui/solid"
import type { Message } from "@maki-chat/api-schema/schema/message.js"
import { DateTime } from "effect"
import { type Accessor, Show, createMemo } from "solid-js"
import { UserAvatar } from "~/components/user-ui/user-popover-content"
import { useUser } from "~/lib/hooks/data/use-user"

interface MessageHeaderProps {
	message: Accessor<Message>
	showAvatar: Accessor<boolean>
	serverId: Accessor<string>
}

export function MessageHeader(props: MessageHeaderProps) {
	const messageTime = createMemo(() => {
		return new Date(DateTime.toDate(props.message().createdAt)).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
	})

	const authorId = createMemo(() => props.message().authorId)

	const { user: author } = useUser(authorId)

	return (
		<>
			<Show when={props.showAvatar()}>
				<UserAvatar user={author()} serverId={props.serverId} />
			</Show>
			<Show when={!props.showAvatar()}>
				<div class="flex w-10 items-center justify-end pr-1 text-[10px] text-muted-foreground leading-tight opacity-0 group-hover:opacity-100">
					{messageTime()}
				</div>
			</Show>
		</>
	)
}
