import { getTauriEvent } from "@hazel/desktop/bridge"
import { Effect, Queue, Schema, Stream } from "effect"
import { isDesktop } from "./desktop"

/** The desktop app menu's items, as the Tauri host reports them (legacy `TauriMenuListener`). */
export const DesktopMenuItem = Schema.Literals(["OpenSettings", "CheckForUpdates", "NewChannel", "Invite"])
export type DesktopMenuItem = typeof DesktopMenuItem.Type

const events: ReadonlyArray<readonly [string, DesktopMenuItem]> = [
	["menu-open-settings", "OpenSettings"],
	["menu-check-updates", "CheckForUpdates"],
	["menu-new-channel", "NewChannel"],
	["menu-invite", "Invite"],
]

/** Every menu item the user picks; empty outside the desktop app. */
export const desktopMenuItems: Stream.Stream<DesktopMenuItem> = Stream.callback<DesktopMenuItem>((queue) =>
	Effect.gen(function* () {
		const event = getTauriEvent()
		if (!isDesktop || event === undefined) return
		for (const [name, item] of events) {
			yield* Effect.acquireRelease(
				Effect.promise(() => event.listen(name, () => Queue.offerUnsafe(queue, item))),
				(unlisten) => Effect.sync(unlisten),
			)
		}
	}).pipe(Effect.andThen(Effect.never)),
)
