// Source: https://github.com/JohannesKlauss/react-hotkeys-hook/blob/main/src/parseHotkeys.ts
import type { Hotkey, KeyboardModifiers } from "react-hotkeys-hook/dist/types"

const reservedModifierKeywords = ["shift", "alt", "meta", "mod", "ctrl"]

const mappedKeys: Record<string, string> = {
	esc: "escape",
	return: "enter",
	".": "period",
	",": "comma",
	"-": "slash",
	" ": "space",
	"`": "backquote",
	"#": "backslash",
	"+": "bracketright",
	ShiftLeft: "shift",
	ShiftRight: "shift",
	AltLeft: "alt",
	AltRight: "alt",
	MetaLeft: "meta",
	MetaRight: "meta",
	OSLeft: "meta",
	OSRight: "meta",
	ControlLeft: "ctrl",
	ControlRight: "ctrl",
}

export function mapKey(key?: string): string {
	return ((key && mappedKeys[key]) || key || "")
		.trim()
		.toLowerCase()
		.replace(/key|digit|numpad|arrow/, "")
}

export function parseHotkey(hotkey: string, combinationKey = "+", description?: string): Hotkey {
	const keys = hotkey
		.toLocaleLowerCase()
		.split(combinationKey)
		.map((k) => mapKey(k))

	const modifiers: KeyboardModifiers = {
		alt: keys.includes("alt"),
		ctrl: keys.includes("ctrl") || keys.includes("control"),
		shift: keys.includes("shift"),
		meta: keys.includes("meta"),
		mod: keys.includes("mod"),
	}

	const singleCharKeys = keys.filter((k) => !reservedModifierKeywords.includes(k))

	return {
		hotkey,
		...modifiers,
		keys: singleCharKeys,
		description,
	}
}
