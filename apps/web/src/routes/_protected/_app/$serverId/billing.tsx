import { createFileRoute } from "@tanstack/solid-router"
import { EmojiPicker } from "~/components/chat-ui/message/emoji-picker"
import { Button } from "~/components/ui/button"
import { Popover } from "~/components/ui/popover"

export const Route = createFileRoute("/_protected/_app/$serverId/billing")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<Popover>
				<Popover.Trigger>
					<Button>Pick</Button>
				</Popover.Trigger>
				<Popover.UnstyledContent>
					<EmojiPicker onSelect={(emoji) => console.log(emoji)} />
				</Popover.UnstyledContent>
			</Popover>
		</div>
	)
}
