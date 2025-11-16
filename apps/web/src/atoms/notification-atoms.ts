import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"

/**
 * localStorage runtime for notification settings persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Do not disturb / Quiet hours enabled/disabled
 */
export const doNotDisturbAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "notifications-dnd-enabled",
	schema: Schema.NullOr(Schema.Boolean),
	defaultValue: () => false,
})

/**
 * Quiet hours start time (HH:MM format)
 */
export const quietHoursStartAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "notifications-quiet-hours-start",
	schema: Schema.NullOr(Schema.String),
	defaultValue: () => "22:00",
})

/**
 * Quiet hours end time (HH:MM format)
 */
export const quietHoursEndAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "notifications-quiet-hours-end",
	schema: Schema.NullOr(Schema.String),
	defaultValue: () => "08:00",
})
