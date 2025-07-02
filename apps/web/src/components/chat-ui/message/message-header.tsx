import type { Doc, Id } from "@hazel/backend"
import { type Accessor, Show, createMemo } from "solid-js"
import { UserAvatar } from "~/components/user-ui/user-popover-content"
import type { Message } from "~/lib/types"

interface MessageHeaderProps {
	message: Accessor<Message>
	showAvatar: Accessor<boolean>
	serverId: Accessor<Id<"servers">>
}

export function MessageHeader(props: MessageHeaderProps) {
	const messageTime = createMemo(() => {
		return new Date(props.message()._creationTime).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
	})

	return (
		<>
			<Show when={props.showAvatar()}>
				<UserAvatar user={props.message().author} serverId={props.serverId} />
			</Show>
			<Show when={!props.showAvatar()}>
				<div class="flex w-10 items-center justify-end pr-1 text-[10px] text-muted-foreground leading-tight opacity-0 group-hover:opacity-100">
					{messageTime()}
				</div>
			</Show>
		</>
	)
}
