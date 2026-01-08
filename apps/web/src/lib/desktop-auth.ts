/**
 * Desktop authentication module for Tauri
 * Implements PKCE OAuth flow with WorkOS AuthKit
 */

import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"
import { openUrl } from "@tauri-apps/plugin-opener"

interface PkceChallenge {
	code_challenge: string
	code_challenge_method: string
}

interface StoredTokens {
	access_token: string | null
	refresh_token: string | null
}

interface TokenResponse {
	access_token: string
	refresh_token?: string
	token_type: string
	expires_in: number
}

// WorkOS configuration
const WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID
const WORKOS_REDIRECT_URI = "hazel://auth/callback"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * Generate PKCE challenge and store verifier
 */
async function generatePkceChallenge(): Promise<PkceChallenge> {
	return invoke<PkceChallenge>("generate_pkce_challenge")
}

/**
 * Get the stored code verifier
 */
async function getCodeVerifier(): Promise<string> {
	return invoke<string>("get_code_verifier")
}

/**
 * Clear the stored code verifier
 */
async function clearCodeVerifier(): Promise<void> {
	return invoke("clear_code_verifier")
}

/**
 * Store tokens securely in system keychain
 */
async function storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
	return invoke("store_tokens", {
		accessToken,
		refreshToken: refreshToken ?? null,
	})
}

/**
 * Get stored tokens from keychain
 */
async function getTokens(): Promise<StoredTokens> {
	return invoke<StoredTokens>("get_tokens")
}

/**
 * Clear all stored tokens
 */
async function clearTokens(): Promise<void> {
	return invoke("clear_tokens")
}

/**
 * Check if user has stored tokens
 */
async function hasTokens(): Promise<boolean> {
	return invoke<boolean>("has_tokens")
}

/**
 * Build the WorkOS authorization URL with PKCE
 */
function buildAuthUrl(pkce: PkceChallenge, options?: { organizationId?: string }): string {
	const params = new URLSearchParams({
		client_id: WORKOS_CLIENT_ID,
		redirect_uri: WORKOS_REDIRECT_URI,
		response_type: "code",
		code_challenge: pkce.code_challenge,
		code_challenge_method: pkce.code_challenge_method,
		// WorkOS specific params
		provider: "authkit",
	})

	if (options?.organizationId) {
		params.set("organization_id", options.organizationId)
	}

	return `https://api.workos.com/user_management/authorize?${params.toString()}`
}

/**
 * Parse the authorization code from the deep link URL
 */
function parseAuthCallback(url: string): { code?: string; error?: string; state?: string } {
	try {
		const parsed = new URL(url)
		return {
			code: parsed.searchParams.get("code") ?? undefined,
			error: parsed.searchParams.get("error") ?? undefined,
			state: parsed.searchParams.get("state") ?? undefined,
		}
	} catch {
		return { error: "Invalid callback URL" }
	}
}

/**
 * Exchange authorization code for tokens via backend
 * We route through our backend to keep the token exchange secure
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse> {
	const response = await fetch(`${BACKEND_URL}/auth/desktop/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			code,
			code_verifier: codeVerifier,
			redirect_uri: WORKOS_REDIRECT_URI,
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`Token exchange failed: ${error}`)
	}

	return response.json()
}

export interface DesktopAuthOptions {
	organizationId?: string
	onSuccess?: (tokens: StoredTokens) => void
	onError?: (error: Error) => void
}

/**
 * Initiate desktop login flow
 * Opens system browser for WorkOS authentication
 */
export async function desktopLogin(options?: DesktopAuthOptions): Promise<UnlistenFn> {
	// Generate PKCE challenge
	const pkce = await generatePkceChallenge()

	// Build auth URL
	const authUrl = buildAuthUrl(pkce, { organizationId: options?.organizationId })

	// Set up deep link listener for callback
	const unlisten = await listen<string>("deep-link", async (event) => {
		const url = event.payload

		// Only handle auth callbacks
		if (!url.startsWith("hazel://auth/callback")) {
			return
		}

		try {
			const { code, error } = parseAuthCallback(url)

			if (error) {
				throw new Error(`Auth error: ${error}`)
			}

			if (!code) {
				throw new Error("No authorization code received")
			}

			// Get the stored code verifier
			const codeVerifier = await getCodeVerifier()

			// Exchange code for tokens
			const tokens = await exchangeCodeForTokens(code, codeVerifier)

			// Store tokens securely
			await storeTokens(tokens.access_token, tokens.refresh_token)

			// Clear the code verifier
			await clearCodeVerifier()

			// Notify success
			options?.onSuccess?.({
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token ?? null,
			})
		} catch (err) {
			await clearCodeVerifier()
			options?.onError?.(err instanceof Error ? err : new Error(String(err)))
		} finally {
			// Clean up listener
			unlisten()
		}
	})

	// Open browser for authentication
	await openUrl(authUrl)

	return unlisten
}

/**
 * Desktop logout - clear stored tokens
 */
export async function desktopLogout(): Promise<void> {
	await clearTokens()
}

/**
 * Get the current access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
	const tokens = await getTokens()
	return tokens.access_token
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export async function isAuthenticated(): Promise<boolean> {
	return hasTokens()
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
	const tokens = await getTokens()

	if (!tokens.refresh_token) {
		return null
	}

	try {
		const response = await fetch(`${BACKEND_URL}/auth/desktop/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				refresh_token: tokens.refresh_token,
			}),
		})

		if (!response.ok) {
			// Refresh failed, clear tokens
			await clearTokens()
			return null
		}

		const newTokens: TokenResponse = await response.json()
		await storeTokens(newTokens.access_token, newTokens.refresh_token)
		return newTokens.access_token
	} catch {
		await clearTokens()
		return null
	}
}

/**
 * Initialize desktop auth - registers token getter for RPC client
 * Call this early in app initialization when running in Tauri
 */
export async function initDesktopAuth(): Promise<void> {
	// Register the token getter with the RPC client middleware
	const { registerAuthTokenGetter } = await import("@hazel/backend/rpc/middleware/client")
	registerAuthTokenGetter(getAccessToken)

	// Try to refresh token on startup if we have one
	const hasAuth = await hasTokens()
	if (hasAuth) {
		await refreshAccessToken()
	}
}

export const desktopAuth = {
	init: initDesktopAuth,
	login: desktopLogin,
	logout: desktopLogout,
	getAccessToken,
	isAuthenticated,
	refreshAccessToken,
	getTokens,
	storeTokens,
	clearTokens,
}
