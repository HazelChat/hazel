/**
 * @module Tauri detection and initialization
 * @platform desktop
 * @description Check if the app is running inside Tauri desktop environment and initialize Tauri-specific features
 */

import { initNativeNotifications } from "./native-notifications"
import { initDeepLinkListener } from "./tauri-auth"
import { startTokenRefresh } from "./token-refresh"

/**
 * Check if the app is running inside Tauri
 */
export const isTauri = (): boolean => {
	return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

/**
 * Initialize all Tauri-specific features
 * Safe to call in any environment - returns early if not in Tauri
 */
export const initTauri = (): void => {
	if (!isTauri()) return

	initNativeNotifications().catch((error: unknown) => {
		console.error("[tauri] Failed to initialize native notifications:", error)
	})

	initDeepLinkListener().catch((error: unknown) => {
		console.error("[tauri] Failed to initialize deep link listener:", error)
	})

	startTokenRefresh().catch((error: unknown) => {
		console.error("[tauri] Failed to start token refresh:", error)
	})
}
