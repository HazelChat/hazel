/**
 * @module Token refresh service for desktop apps
 * @platform desktop
 * @description Automatically refreshes access tokens before they expire
 */

import { isTauri } from "./tauri"
import { clearTokens, getExpiresAt, getRefreshToken, storeTokens } from "./token-storage"

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000

let refreshTimer: ReturnType<typeof setTimeout> | null = null
let isRefreshing = false

/**
 * Start the token refresh scheduler
 * Call this on app startup if user is already authenticated
 */
export const startTokenRefresh = async (): Promise<void> => {
	// Only run in Tauri environment
	if (!isTauri()) return

	const expiresAt = await getExpiresAt()
	if (!expiresAt) {
		console.log("[TokenRefresh] No token expiry found, skipping refresh scheduling")
		return
	}

	const timeUntilRefresh = expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		// Token expired or about to expire, refresh now
		console.log("[TokenRefresh] Token expired or expiring soon, refreshing now")
		await refreshTokens()
	} else {
		// Schedule refresh
		console.log(
			`[TokenRefresh] Scheduling refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`,
		)
		stopTokenRefresh() // Clear any existing timer
		refreshTimer = setTimeout(refreshTokens, timeUntilRefresh)
	}
}

/**
 * Perform the token refresh
 */
const refreshTokens = async (): Promise<boolean> => {
	if (isRefreshing) {
		console.log("[TokenRefresh] Already refreshing, skipping")
		return false
	}

	isRefreshing = true

	try {
		const refreshToken = await getRefreshToken()
		if (!refreshToken) {
			console.log("[TokenRefresh] No refresh token found, user needs to re-login")
			await handleRefreshFailure()
			return false
		}

		const backendUrl = import.meta.env.VITE_BACKEND_URL
		console.log("[TokenRefresh] Refreshing tokens...")

		const response = await fetch(`${backendUrl}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		})

		if (!response.ok) {
			console.error("[TokenRefresh] Refresh failed with status:", response.status)
			await handleRefreshFailure()
			return false
		}

		const data = await response.json()
		const { accessToken, refreshToken: newRefreshToken, expiresIn } = data

		await storeTokens(accessToken, newRefreshToken, expiresIn)
		console.log("[TokenRefresh] Tokens refreshed successfully")

		// Schedule next refresh
		await startTokenRefresh()
		return true
	} catch (error) {
		console.error("[TokenRefresh] Error refreshing tokens:", error)
		await handleRefreshFailure()
		return false
	} finally {
		isRefreshing = false
	}
}

/**
 * Handle refresh failure - clear tokens and trigger re-authentication
 */
const handleRefreshFailure = async (): Promise<void> => {
	await clearTokens()
	stopTokenRefresh()

	// Dispatch custom event for the app to handle re-authentication
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("auth:session-expired"))
	}
}

/**
 * Stop the token refresh scheduler
 * Call this on logout
 */
export const stopTokenRefresh = (): void => {
	if (refreshTimer) {
		clearTimeout(refreshTimer)
		refreshTimer = null
	}
}

/**
 * Force an immediate token refresh
 * Useful when you need fresh tokens for a specific operation
 */
export const forceRefresh = async (): Promise<boolean> => {
	if (!isTauri()) return false
	return refreshTokens()
}
