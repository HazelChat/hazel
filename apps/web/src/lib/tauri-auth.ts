/**
 * @module Tauri desktop authentication flow
 * @platform desktop
 * @description OAuth authentication for desktop apps using localhost server with web app callback
 *
 * Flow: Desktop app starts local server on dynamic port, OAuth redirects to web app,
 * web app POSTs auth data back to localhost server with nonce validation.
 */

import type { OrganizationId } from "@hazel/schema"
import { startTokenRefresh } from "./token-refresh"
import { storeTokens } from "./token-storage"

type OpenerApi = typeof import("@tauri-apps/plugin-opener")
type CoreApi = typeof import("@tauri-apps/api/core")
type EventApi = typeof import("@tauri-apps/api/event")

const opener: OpenerApi | undefined = (window as any).__TAURI__?.opener
const core: CoreApi | undefined = (window as any).__TAURI__?.core
const event: EventApi | undefined = (window as any).__TAURI__?.event

interface DesktopAuthOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface TokenResponse {
	accessToken: string
	refreshToken: string
	expiresIn: number
	user: {
		id: string
		email: string
		firstName: string
		lastName: string
	}
}

/**
 * Exchange authorization code for access token
 */
const exchangeCodeForToken = async (code: string, state: string): Promise<TokenResponse> => {
	const backendUrl = import.meta.env.VITE_BACKEND_URL
	const response = await fetch(`${backendUrl}/auth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code, state }),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`Token exchange failed: ${error}`)
	}

	return response.json()
}

/**
 * Initiate desktop OAuth flow
 * Starts local server on dynamic port, OAuth redirects to web app which POSTs back
 */
export const initiateDesktopAuth = async (options: DesktopAuthOptions = {}): Promise<void> => {
	if (!opener) throw new Error("Tauri opener not available")
	if (!core || !event) throw new Error("Tauri core/event not available")

	const backendUrl = import.meta.env.VITE_BACKEND_URL
	const returnTo = options.returnTo || "/"

	console.log("[tauri-auth] Initiating desktop auth flow")

	// Start local OAuth server with dynamic port and nonce
	const [port, nonce] = await core.invoke<[number, string]>("start_oauth_server")
	console.log(
		"[tauri-auth] OAuth server started on port:",
		port,
		"with nonce:",
		nonce.substring(0, 8) + "...",
	)

	// Set up listener for OAuth callback with proper cleanup
	const cleanup = {
		unlisten: null as (() => void) | null,
		timeoutId: null as ReturnType<typeof setTimeout> | null,
	}

	const callbackPromise = new Promise<string>((resolve, reject) => {
		cleanup.timeoutId = setTimeout(() => {
			reject(new Error("OAuth callback timeout after 2 minutes"))
		}, 120000)

		event
			.listen<string>("oauth-callback", (evt) => {
				if (cleanup.timeoutId) clearTimeout(cleanup.timeoutId)
				console.log("[tauri-auth] Received OAuth callback")
				resolve(evt.payload)
			})
			.then((unlistenFn) => {
				cleanup.unlisten = unlistenFn
			})
	})

	// Build login URL with desktop connection info
	const loginUrl = new URL("/auth/login/desktop", backendUrl)
	loginUrl.searchParams.set("returnTo", returnTo)
	loginUrl.searchParams.set("desktopPort", port.toString())
	loginUrl.searchParams.set("desktopNonce", nonce)
	if (options.organizationId) {
		loginUrl.searchParams.set("organizationId", options.organizationId)
	}
	if (options.invitationToken) {
		loginUrl.searchParams.set("invitationToken", options.invitationToken)
	}

	console.log("[tauri-auth] Opening URL:", loginUrl.toString())

	// Open system browser for OAuth
	await opener.openUrl(loginUrl.toString())
	console.log("[tauri-auth] Browser opened, waiting for web callback...")

	// Wait for OAuth callback with cleanup
	let code: string
	let state: string
	try {
		const callbackUrl = await callbackPromise
		const url = new URL(callbackUrl)
		code = url.searchParams.get("code")!
		state = url.searchParams.get("state") || "{}"
	} finally {
		// Clean up listener and timeout
		cleanup.unlisten?.()
		if (cleanup.timeoutId) clearTimeout(cleanup.timeoutId)
	}

	if (!code) {
		throw new Error("No authorization code received")
	}

	console.log("[tauri-auth] Got authorization code, exchanging for token...")

	// Exchange code for token
	const { accessToken, refreshToken, expiresIn } = await exchangeCodeForToken(code, state)

	// Store tokens securely
	await storeTokens(accessToken, refreshToken, expiresIn)
	console.log("[tauri-auth] Tokens stored securely")

	// Start background token refresh
	await startTokenRefresh()
	console.log("[tauri-auth] Token refresh scheduled, navigating to:", returnTo)

	// Navigate to return path
	window.location.href = returnTo
}
