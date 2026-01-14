import { Atom, useAtomMount, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { Schema } from "effect"
import { useCallback, useEffect, useRef, useState } from "react"
import { platformStorageRuntime } from "~/lib/platform-storage"

interface NotificationSoundSettings {
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

const notificationSettingsAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "notification-sound-settings",
	schema: Schema.NullOr(NotificationSoundSettingsSchema),
	defaultValue: () => ({
		enabled: true,
		volume: 0.5,
		soundFile: "notification01" as const,
		cooldownMs: 2000,
	}),
})

const audioElementAtom = Atom.make<HTMLAudioElement | null>((get) => {
	if (typeof window === "undefined") return null

	// Create a stable audio element without reading settings
	// Settings will be applied dynamically when playing
	const audio = new Audio()
	audio.volume = 0.5 // Default volume

	get.addFinalizer(() => {
		audio.pause()
		audio.src = ""
	})

	return audio
}).pipe(Atom.keepAlive)

export function useNotificationSound() {
	const settings = useAtomValue(notificationSettingsAtom) || {
		enabled: true,
		volume: 0.5,
		soundFile: "notification01" as const,
		cooldownMs: 2000,
	}
	const setSettings = useAtomSet(notificationSettingsAtom)

	useAtomMount(audioElementAtom)

	const audioElement = useAtomValue(audioElementAtom)

	const lastPlayedRef = useRef<number>(0)
	const isPlayingRef = useRef<boolean>(false)
	const [isPrimed, setIsPrimed] = useState(false)

	// Prime audio on first user interaction to satisfy browser autoplay policy
	useEffect(() => {
		if (!audioElement || isPrimed) return

		let mounted = true

		const primeAudio = async () => {
			try {
				// Play at 0 volume then pause to satisfy autoplay policy
				const originalVolume = audioElement.volume
				audioElement.volume = 0
				audioElement.src = "/sounds/notification01.mp3"
				await audioElement.play()
				audioElement.pause()
				audioElement.volume = originalVolume

				// Only update state if component is still mounted
				if (mounted) {
					setIsPrimed(true)
				}
			} catch (error) {
				console.warn("Audio not primed yet:", error)
			}
		}

		document.addEventListener("click", primeAudio, { once: true })

		return () => {
			mounted = false
			document.removeEventListener("click", primeAudio)
		}
	}, [audioElement, isPrimed])

	const playSound = useCallback(async () => {
		if (!settings.enabled || !audioElement) return

		const now = Date.now()
		if (now - lastPlayedRef.current < settings.cooldownMs) {
			return
		}

		if (isPlayingRef.current) return

		try {
			isPlayingRef.current = true
			lastPlayedRef.current = now

			// Update audio properties before playing
			audioElement.src = `/sounds/${settings.soundFile}.mp3`
			audioElement.volume = settings.volume
			audioElement.currentTime = 0
			await audioElement.play()
		} catch (error) {
			console.error("Failed to play notification sound:", error)
		} finally {
			isPlayingRef.current = false
		}
	}, [settings, audioElement])

	const updateSettings = useCallback(
		(updates: Partial<NotificationSoundSettings>) => {
			setSettings((prev) => ({
				...(prev || {
					enabled: true,
					volume: 0.5,
					soundFile: "notification01" as const,
					cooldownMs: 2000,
				}),
				...updates,
			}))
		},
		[setSettings],
	)

	const testSound = useCallback(async () => {
		if (!audioElement) return

		try {
			// Update audio properties before playing
			audioElement.src = `/sounds/${settings.soundFile}.mp3`
			audioElement.volume = settings.volume
			audioElement.currentTime = 0
			await audioElement.play()
		} catch (error) {
			console.error("Failed to play test sound:", error)
		}
	}, [audioElement, settings])

	return {
		settings,
		updateSettings,
		playSound,
		testSound,
		isPrimed,
	}
}
