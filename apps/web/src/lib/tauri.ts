/**
 * @module Tauri detection and utilities
 * @platform desktop
 * @description Check if the app is running inside Tauri desktop environment
 */

/**
 * Check if the app is running inside Tauri
 */
export const isTauri = (): boolean => {
	return typeof window !== "undefined" && "__TAURI__" in window
}
