/**
 * Platform detection utilities for Tauri/Web hybrid app
 */

/**
 * Check if running inside Tauri desktop app
 */
export const isTauri = (): boolean => {
    return typeof window !== "undefined" && "__TAURI__" in window
}

/**
 * Check if running in web browser
 */
export const isWeb = (): boolean => !isTauri()

/**
 * Get current platform
 */
export const getPlatform = (): "tauri" | "web" => {
    return isTauri() ? "tauri" : "web"
}

/**
 * Platform utilities object
 */
export const platform = {
    isTauri,
    isWeb,
    get current(): "tauri" | "web" {
        return getPlatform()
    },
} as const
