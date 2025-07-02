import type { Id } from "@hazel/backend"
import { type Accessor, onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { useHotkey, useLayer } from "~/lib/hotkey-manager"
import { Command } from "../ui/command-menu"
import { ChannelBar } from "./channel-bar"

const [commandBarState, setCommandBarState] = createStore({
	open: false,
})

export { commandBarState, setCommandBarState }

export const CommandBar = (props: {
	serverId: Accessor<Id<"servers">>
}) => {
	useLayer("command-bar")
	useHotkey("command-bar", {
		key: "k",
		meta: true,
		description: "Open command bar",
		handler: () => {
			setCommandBarState("open", true)
		},
	})

	return (
		<Command.Dialog
			open={commandBarState.open}
			onOpenChange={(value) => setCommandBarState("open", value.open)}
		>
			<Command.Input />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>

				<ChannelBar serverId={props.serverId} />
			</Command.List>
		</Command.Dialog>
	)
}
