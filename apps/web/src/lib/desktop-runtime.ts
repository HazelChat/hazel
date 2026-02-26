/**
 * @module Desktop runtime detection and initialization
 * @platform desktop
 * @description Check if the app is running inside the Electrobun desktop runtime.
 */

import { initNativeNotifications } from "./native-notifications"

/**
 * Check if the app is running inside the desktop runtime
 */
export const isDesktopRuntime = (): boolean => {
	return typeof window !== "undefined" && "__electrobun" in window
}

/**
 * Check if the app is running on macOS inside desktop runtime
 * Used for platform-specific UI adjustments like titlebar padding
 */
export const isDesktopMacOS = (): boolean => {
	return isDesktopRuntime() && navigator.platform.toLowerCase().includes("mac")
}

/**
 * CSS class for desktop titlebar padding on macOS
 * Applied to top-level elements that need to clear the traffic lights
 */
export const DESKTOP_TITLEBAR_PADDING_CLASS = "pt-5"

/**
 * Initialize all desktop-specific features
 * Safe to call in any environment - returns early if not in desktop runtime
 */
export const initDesktopRuntime = async (): Promise<void> => {
	if (!isDesktopRuntime()) return

	initNativeNotifications().catch((error: unknown) => {
		console.error("[desktop-runtime] Failed to initialize native notifications:", error)
	})
}
