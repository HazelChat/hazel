import type { Hotkey } from "@tanstack/react-hotkeys"

export type AppHotkeyCategory = "global" | "navigation" | "modal"

export interface AppHotkeyDefinition {
	id: string
	category: AppHotkeyCategory
	label: string
	description: string
	defaultHotkey: Hotkey
}

export const HOTKEY_DEFINITIONS = [
	{
		id: "commandPalette.open",
		category: "global",
		label: "Open Command Palette",
		description: "Open the command palette home screen.",
		defaultHotkey: "Mod+K",
	},
	{
		id: "search.open",
		category: "navigation",
		label: "Search Messages",
		description: "Open command palette directly in message search.",
		defaultHotkey: "Mod+Shift+F",
	},
	{
		id: "channel.create",
		category: "navigation",
		label: "Create Channel",
		description: "Open the create channel modal.",
		defaultHotkey: "Mod+Alt+N",
	},
	{
		id: "dm.create",
		category: "navigation",
		label: "Create DM",
		description: "Open the create direct message modal.",
		defaultHotkey: "Mod+Alt+D",
	},
	{
		id: "invite.email",
		category: "navigation",
		label: "Invite People",
		description: "Open the invite people modal.",
		defaultHotkey: "Mod+Alt+I",
	},
	{
		id: "sidebar.toggle",
		category: "global",
		label: "Toggle Sidebar",
		description: "Toggle the left sidebar visibility.",
		defaultHotkey: "Mod+B",
	},
	{
		id: "imageViewer.close",
		category: "modal",
		label: "Close Image Viewer",
		description: "Close the image viewer modal.",
		defaultHotkey: "Escape",
	},
	{
		id: "imageViewer.prev",
		category: "modal",
		label: "Previous Image",
		description: "Show the previous image in the viewer.",
		defaultHotkey: "ArrowLeft",
	},
	{
		id: "imageViewer.next",
		category: "modal",
		label: "Next Image",
		description: "Show the next image in the viewer.",
		defaultHotkey: "ArrowRight",
	},
] as const satisfies ReadonlyArray<AppHotkeyDefinition>

export type AppHotkeyActionId = (typeof HOTKEY_DEFINITIONS)[number]["id"]

export const HOTKEY_DEFINITIONS_BY_ID = HOTKEY_DEFINITIONS.reduce(
	(accumulator, definition) => {
		accumulator[definition.id as AppHotkeyActionId] = definition
		return accumulator
	},
	{} as Record<AppHotkeyActionId, (typeof HOTKEY_DEFINITIONS)[number]>,
)

export function isAppHotkeyActionId(value: string): value is AppHotkeyActionId {
	return Object.hasOwn(HOTKEY_DEFINITIONS_BY_ID, value)
}
