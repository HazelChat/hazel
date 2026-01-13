/**
 * Secure token storage for desktop apps
 * Uses localStorage for now - can upgrade to tauri-plugin-store for encryption later
 */

const TOKEN_KEY = "hazel_access_token"

/**
 * Store access token
 */
export const storeAccessToken = (token: string): void => {
	localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
	return localStorage.getItem(TOKEN_KEY)
}

/**
 * Clear stored access token
 */
export const clearAccessToken = (): void => {
	localStorage.removeItem(TOKEN_KEY)
}
