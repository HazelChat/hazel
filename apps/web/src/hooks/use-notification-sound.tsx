import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { useCallback } from "react"
import {
	type NotificationSoundSettings,
	notificationSoundSettingsAtom,
} from "~/atoms/notification-sound-atoms"
import { notificationSoundManager } from "~/lib/notification-sound-manager"

const DEFAULT_SETTINGS: NotificationSoundSettings = {
	enabled: true,
	volume: 0.5,
	soundFile: "notification01",
	cooldownMs: 2000,
}

export function useNotificationSound() {
	const settings = useAtomValue(notificationSoundSettingsAtom) ?? DEFAULT_SETTINGS
	const setSettings = useAtomSet(notificationSoundSettingsAtom)

	const updateSettings = useCallback(
		(updates: Partial<NotificationSoundSettings>) => {
			setSettings((prev) => ({
				...(prev ?? DEFAULT_SETTINGS),
				...updates,
			}))
		},
		[setSettings],
	)

	const testSound = useCallback(async () => {
		await notificationSoundManager.testSound()
	}, [])

	return {
		settings,
		updateSettings,
		testSound,
	}
}
