/**
 * @module Notification Sound Atoms
 * @description Atoms for notification sound system state management
 */

import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"
import { platformStorageRuntime } from "~/lib/platform-storage"

/**
 * Session initialization timestamp - notifications before this are "old"
 * and should not trigger sounds (prevents sounds on app startup)
 */
export const sessionStartTimeAtom = Atom.make<Date>(new Date()).pipe(Atom.keepAlive)

/**
 * Notification sound settings schema and atom
 */
export interface NotificationSoundSettings {
	enabled: boolean
	volume: number
	soundFile: "notification01" | "notification03" | "ping" | "chime" | "bell" | "ding" | "pop"
	cooldownMs: number
}

const NotificationSoundSettingsSchema = Schema.Struct({
	enabled: Schema.Boolean,
	volume: Schema.Number,
	soundFile: Schema.Literal("notification01", "notification03", "ping", "chime", "bell", "ding", "pop"),
	cooldownMs: Schema.Number,
})

const DEFAULT_SETTINGS: NotificationSoundSettings = {
	enabled: true,
	volume: 0.5,
	soundFile: "notification01",
	cooldownMs: 2000,
}

export const notificationSoundSettingsAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "notification-sound-settings",
	schema: Schema.NullOr(NotificationSoundSettingsSchema),
	defaultValue: () => DEFAULT_SETTINGS,
})

/**
 * Helper to parse time string (HH:MM) to hour number
 */
const parseTimeToHour = (time: string): number => {
	const [hours] = time.split(":").map(Number)
	return hours ?? 0
}

/**
 * Check if current time is within quiet hours.
 * Evaluates at READ time (not subscription time) for accurate results.
 */
export const isInQuietHours = (quietHoursStart: string | null, quietHoursEnd: string | null): boolean => {
	if (!quietHoursStart || !quietHoursEnd) {
		return false
	}

	const now = new Date()
	const currentHour = now.getHours()
	const start = parseTimeToHour(quietHoursStart)
	const end = parseTimeToHour(quietHoursEnd)

	// Handle quiet hours that span midnight
	if (start <= end) {
		return currentHour >= start && currentHour < end
	}
	return currentHour >= start || currentHour < end
}

/**
 * Computed atom that determines if sounds should be muted.
 * Checks DND, enabled state, and quiet hours at READ time.
 * This function returns a getter that can be called at any time
 * to get the current muted state.
 */
export const createIsMutedGetter = (
	settings: NotificationSoundSettings | null,
	doNotDisturb: boolean | null,
	quietHoursStart: string | null,
	quietHoursEnd: string | null,
): (() => boolean) => {
	return () => {
		// Check if notifications are disabled
		if (!settings?.enabled) {
			return true
		}

		// Check Do Not Disturb mode
		if (doNotDisturb) {
			return true
		}

		// Check quiet hours at READ time (not subscription time)
		if (isInQuietHours(quietHoursStart, quietHoursEnd)) {
			return true
		}

		return false
	}
}
