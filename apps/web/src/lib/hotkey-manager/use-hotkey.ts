import { onCleanup, onMount } from "solid-js"
import type { HotkeyConfig } from "./hotkey-manager"
import { useHotkeys } from "./hotkey-provider"

export function useHotkey(
	layerName: string,
	config: Omit<HotkeyConfig, "handler"> & { handler: () => void },
) {
	const { registerHotkey } = useHotkeys()

	onMount(() => {
		const cleanup = registerHotkey(layerName, {
			...config,
			handler: () => config.handler(),
		})

		onCleanup(cleanup)
	})
}

export function useLayer(name: string, priority = 0) {
	const { registerLayer, activateLayer, deactivateLayer } = useHotkeys()

	onMount(() => {
		registerLayer(name, priority)
		activateLayer(name)

		onCleanup(() => {
			deactivateLayer(name)
		})
	})
}
