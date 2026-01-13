/**
 * Tauri detection and utilities
 */

/**
 * Check if the app is running inside Tauri
 */
export const isTauri = (): boolean => {
	return typeof window !== "undefined" && "__TAURI__" in window
}
