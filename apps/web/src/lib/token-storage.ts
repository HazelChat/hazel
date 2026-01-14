/**
 * @module Secure token storage for desktop apps
 * @platform desktop
 * @description Store/retrieve access tokens for desktop authentication using Tauri's encrypted store
 *
 * Note: This module is only used by the Tauri desktop app.
 * The web app uses cookies (WorkOS sealed sessions) for authentication.
 */

const STORE_NAME = "auth.json"
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"

// Lazy-loaded store instance
let storePromise: Promise<Awaited<ReturnType<typeof import("@tauri-apps/plugin-store").load>>> | null = null

/**
 * Get or create the store instance
 */
const getStore = async () => {
	if (!storePromise) {
		storePromise = import("@tauri-apps/plugin-store").then((mod) =>
			mod.load(STORE_NAME, { defaults: {}, autoSave: true }),
		)
	}
	return storePromise
}

/**
 * Store all auth tokens in Tauri store
 */
export const storeTokens = async (
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
): Promise<void> => {
	const s = await getStore()
	await s.set(ACCESS_TOKEN_KEY, accessToken)
	await s.set(REFRESH_TOKEN_KEY, refreshToken)
	await s.set(EXPIRES_AT_KEY, Date.now() + expiresIn * 1000)
}

/**
 * Get stored access token
 */
export const getAccessToken = async (): Promise<string | null> => {
	const s = await getStore()
	return (await s.get<string>(ACCESS_TOKEN_KEY)) ?? null
}

/**
 * Get stored refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
	const s = await getStore()
	return (await s.get<string>(REFRESH_TOKEN_KEY)) ?? null
}

/**
 * Get token expiration timestamp (ms)
 */
export const getExpiresAt = async (): Promise<number | null> => {
	const s = await getStore()
	return (await s.get<number>(EXPIRES_AT_KEY)) ?? null
}

/**
 * Clear all stored tokens from Tauri store
 */
export const clearTokens = async (): Promise<void> => {
	const s = await getStore()
	await s.delete(ACCESS_TOKEN_KEY)
	await s.delete(REFRESH_TOKEN_KEY)
	await s.delete(EXPIRES_AT_KEY)
}
