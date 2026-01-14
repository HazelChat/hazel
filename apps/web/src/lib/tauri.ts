/**
 * @module Tauri detection and initialization
 * @platform desktop
 * @description Check if the app is running inside Tauri desktop environment and initialize Tauri-specific features
 */

import { initNativeNotifications } from "./native-notifications"
import { initDeepLinkListener } from "./tauri-auth"
import { startTokenRefresh } from "./token-refresh"
import { syncTokensToLocalStorage } from "./token-storage"

/**
 * Check if the app is running inside Tauri
 */
export const isTauri = (): boolean => {
	return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

/**
 * Initialize all Tauri-specific features
 * Safe to call in any environment - returns early if not in Tauri
 * MUST be awaited before rendering to ensure tokens are synced
 */
export const initTauri = async (): Promise<void> => {
	if (!isTauri()) return

	// Sync tokens to localStorage FIRST and await it - prevents race condition
	// where first API request fires before tokens are available
	try {
		await syncTokensToLocalStorage()
	} catch (error) {
		console.error("[tauri] Failed to sync tokens to localStorage:", error)
	}

	// Other features can initialize in parallel (non-blocking)
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
