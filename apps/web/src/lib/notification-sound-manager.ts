/**
 * @module Notification Sound Manager
 * @description Singleton class for managing notification sounds with proper
 * deduplication, cooldown, and context-aware suppression.
 */

import { isTauri } from "./tauri"

export interface NotificationSoundConfig {
	soundFile: "notification01" | "notification03" | "ping" | "chime" | "bell" | "ding" | "pop"
	volume: number
	cooldownMs: number
}

export interface NotificationSoundDependencies {
	getCurrentChannelId: () => string | null
	getSessionStartTime: () => Date
	getIsMuted: () => boolean
	getConfig: () => NotificationSoundConfig
}

export interface PlaySoundParams {
	notificationId: string
	channelId: string | null
	createdAt: Date
}

export class NotificationSoundManager {
	private audioElement: HTMLAudioElement | null = null
	private isPrimed = false
	private playedIds = new Set<string>()
	private lastPlayedAt = 0
	private dependencies: NotificationSoundDependencies | null = null
	private primeClickHandler: (() => void) | null = null

	// Maximum size for playedIds to prevent memory leaks
	private static readonly MAX_PLAYED_IDS = 1000

	constructor() {
		if (typeof window !== "undefined") {
			this.audioElement = new Audio()
			this.audioElement.volume = 0.5

			// In Tauri, skip browser autoplay priming (no restrictions)
			if (isTauri()) {
				this.isPrimed = true
			}
		}
	}

	/**
	 * Set reactive dependencies. Call this whenever dependencies change.
	 */
	setDependencies(deps: NotificationSoundDependencies): void {
		this.dependencies = deps
	}

	/**
	 * Initialize audio priming for browser autoplay policy.
	 * Should be called once when component mounts.
	 */
	initPriming(): () => void {
		if (this.isPrimed || !this.audioElement) {
			return () => {}
		}

		const primeAudio = async () => {
			if (!this.audioElement || this.isPrimed) return

			try {
				const originalVolume = this.audioElement.volume
				this.audioElement.volume = 0
				this.audioElement.src = "/sounds/notification01.mp3"
				await this.audioElement.play()
				this.audioElement.pause()
				this.audioElement.volume = originalVolume
				this.isPrimed = true
			} catch (error) {
				console.warn("[notification-sound-manager] Audio not primed yet:", error)
			}
		}

		this.primeClickHandler = primeAudio
		document.addEventListener("click", primeAudio, { once: true })

		return () => {
			if (this.primeClickHandler) {
				document.removeEventListener("click", this.primeClickHandler)
				this.primeClickHandler = null
			}
		}
	}

	/**
	 * Check if audio is primed and ready to play
	 */
	getIsPrimed(): boolean {
		return this.isPrimed
	}

	/**
	 * Determine if a notification sound should play.
	 * Returns false if ANY of these conditions are true:
	 * 1. Notification ID already in playedIds set
	 * 2. Sound is muted (DND, disabled, quiet hours)
	 * 3. Notification was created before session start (old notification)
	 * 4. User is viewing the source channel AND window is focused
	 * 5. Within cooldown period since last sound
	 */
	shouldPlaySound(params: PlaySoundParams): boolean {
		if (!this.dependencies) {
			console.warn("[notification-sound-manager] Dependencies not set")
			return false
		}

		const { notificationId, channelId, createdAt } = params
		const config = this.dependencies.getConfig()

		// 1. Already played this notification
		if (this.playedIds.has(notificationId)) {
			return false
		}

		// 2. Sounds are muted (DND, disabled, quiet hours)
		if (this.dependencies.getIsMuted()) {
			return false
		}

		// 3. Old notification (before session start)
		const sessionStartTime = this.dependencies.getSessionStartTime()
		if (createdAt < sessionStartTime) {
			return false
		}

		// 4. User is viewing the source channel AND window is focused AND visible
		const currentChannelId = this.dependencies.getCurrentChannelId()
		if (
			channelId !== null &&
			channelId === currentChannelId &&
			document.hasFocus() &&
			document.visibilityState === "visible"
		) {
			return false
		}

		// 5. Within cooldown period
		const now = Date.now()
		if (now - this.lastPlayedAt < config.cooldownMs) {
			return false
		}

		return true
	}

	/**
	 * Play a notification sound if all conditions are met.
	 * Returns true if sound was played, false otherwise.
	 */
	async playSound(params: PlaySoundParams): Promise<boolean> {
		if (!this.audioElement || !this.isPrimed || !this.dependencies) {
			return false
		}

		if (!this.shouldPlaySound(params)) {
			return false
		}

		const config = this.dependencies.getConfig()

		// Mark as played immediately (before async play)
		this.playedIds.add(params.notificationId)
		this.lastPlayedAt = Date.now()

		// Prevent memory leak by limiting playedIds size
		if (this.playedIds.size > NotificationSoundManager.MAX_PLAYED_IDS) {
			const idsArray = Array.from(this.playedIds)
			const toRemove = idsArray.slice(0, Math.floor(NotificationSoundManager.MAX_PLAYED_IDS / 2))
			for (const id of toRemove) {
				this.playedIds.delete(id)
			}
		}

		try {
			this.audioElement.src = `/sounds/${config.soundFile}.mp3`
			this.audioElement.volume = config.volume
			this.audioElement.currentTime = 0
			await this.audioElement.play()
			return true
		} catch (error) {
			console.error("[notification-sound-manager] Failed to play notification sound:", error)
			// Remove from played since it didn't actually play
			this.playedIds.delete(params.notificationId)
			return false
		}
	}

	/**
	 * Play a test sound (bypasses all checks).
	 * Used for the "Test Sound" button in settings.
	 */
	async testSound(): Promise<boolean> {
		if (!this.audioElement || !this.dependencies) {
			return false
		}

		const config = this.dependencies.getConfig()

		try {
			this.audioElement.src = `/sounds/${config.soundFile}.mp3`
			this.audioElement.volume = config.volume
			this.audioElement.currentTime = 0
			await this.audioElement.play()
			return true
		} catch (error) {
			console.error("[notification-sound-manager] Failed to play test sound:", error)
			return false
		}
	}

	/**
	 * Clean up resources when manager is no longer needed.
	 */
	dispose(): void {
		if (this.primeClickHandler) {
			document.removeEventListener("click", this.primeClickHandler)
			this.primeClickHandler = null
		}

		if (this.audioElement) {
			this.audioElement.pause()
			this.audioElement.src = ""
			this.audioElement = null
		}

		this.playedIds.clear()
	}
}

// Singleton instance
export const notificationSoundManager = new NotificationSoundManager()
