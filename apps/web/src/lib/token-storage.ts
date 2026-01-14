/**
 * @module Secure token storage for desktop apps
 * @platform desktop
 * @description Store/retrieve access tokens for desktop authentication
 *
 * TODO: Upgrade to tauri-plugin-store for encrypted storage in Tauri environment.
 * localStorage is vulnerable to XSS attacks. For production, tokens should be
 * stored using the system keychain or encrypted storage.
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
