/**
 * @module Tauri detection and initialization
 * @platform desktop
 * @description Check if the app is running inside Tauri desktop environment and initialize Tauri-specific features
 *
 * Note: Token refresh is now handled by the desktopTokenSchedulerAtom in ~/atoms/desktop-auth.ts
 * which is mounted via useAuth() in auth.tsx
 */

import { initNativeNotifications } from "./native-notifications"

/**
 * Check if the app is running inside Tauri
 */
export const isTauri = (): boolean => {
	return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

/**
 * Check if the app is running on macOS inside Tauri
 * Used for platform-specific UI adjustments like titlebar padding
 */
export const isTauriMacOS = (): boolean => {
	return isTauri() && navigator.platform.toLowerCase().includes("mac")
}

/**
 * CSS class for Tauri titlebar padding on macOS
 * Applied to top-level elements that need to clear the traffic lights
 */
export const TAURI_TITLEBAR_PADDING_CLASS = "pt-5"

/**
 * Initialize all Tauri-specific features
 * Safe to call in any environment - returns early if not in Tauri
 *
 * Note: Desktop auth (token loading and refresh scheduling) is handled by
 * Effect Atoms mounted in useAuth(), not here.
 */
export const initTauri = async (): Promise<void> => {
	if (!isTauri()) return

	// Initialize native notifications (non-blocking)
	initNativeNotifications().catch((error: unknown) => {
		console.error("[tauri] Failed to initialize native notifications:", error)
	})
}
