import {
	formatForDisplay,
	useHotkey,
	type HotkeyCallback,
	type UseHotkeyOptions,
} from "@tanstack/react-hotkeys"
import { useResolvedHotkey } from "~/atoms/hotkey-atoms"
import type { AppHotkeyActionId } from "~/lib/hotkeys/hotkey-registry"

export const useAppHotkey = (
	actionId: AppHotkeyActionId,
	callback: HotkeyCallback,
	options: UseHotkeyOptions = {},
) => {
	const hotkey = useResolvedHotkey(actionId)
	useHotkey(hotkey, callback, options)
}

export const useAppHotkeyLabel = (
	actionId: AppHotkeyActionId,
	options?: Parameters<typeof formatForDisplay>[1],
): string => {
	const hotkey = useResolvedHotkey(actionId)
	return formatForDisplay(hotkey, options)
}
