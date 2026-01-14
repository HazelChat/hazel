/**
 * @module Tauri desktop authentication flow
 * @platform desktop
 * @description OAuth authentication for desktop apps using localhost server (dev) or deep links (prod)
 *
 * - Dev mode: Uses localhost OAuth server on fixed port (17927)
 * - Prod mode: Uses deep links (hazel://auth/callback)
 */

import type { OrganizationId } from "@hazel/schema"
import { startTokenRefresh } from "./token-refresh"
import { storeTokens } from "./token-storage"

type DeepLinkApi = typeof import("@tauri-apps/plugin-deep-link")
type OpenerApi = typeof import("@tauri-apps/plugin-opener")
type CoreApi = typeof import("@tauri-apps/api/core")
type EventApi = typeof import("@tauri-apps/api/event")

const deepLink: DeepLinkApi | undefined = (window as any).__TAURI__?.deepLink
const opener: OpenerApi | undefined = (window as any).__TAURI__?.opener
const core: CoreApi | undefined = (window as any).__TAURI__?.core
const event: EventApi | undefined = (window as any).__TAURI__?.event

interface DesktopAuthOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface AuthCallbackParams {
	code: string
	state: string
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

// Resolver for deep link callback (prod mode)
let deepLinkResolver: ((params: AuthCallbackParams) => void) | null = null

/**
 * Initialize deep link listener for production auth callbacks
 * Call once at app startup
 */
export const initDeepLinkListener = async (): Promise<void> => {
	if (!deepLink) return

	const handleUrl = (url: string) => {
		try {
			const parsed = new URL(url)
			// hazel://auth/callback parses as host="auth", pathname="/callback"
			const fullPath = `${parsed.host}${parsed.pathname}`
			if (fullPath === "auth/callback") {
				const code = parsed.searchParams.get("code")
				const state = parsed.searchParams.get("state") || "{}"
				if (code && deepLinkResolver) {
					console.log("[tauri-auth] Deep link callback received")
					deepLinkResolver({ code, state })
					deepLinkResolver = null
				}
			}
		} catch (e) {
			console.error("[tauri-auth] Failed to parse deep link:", e)
		}
	}

	// Check for cold start deep link (app opened via deep link)
	try {
		const urls = await deepLink.getCurrent()
		if (urls?.[0]) {
			console.log("[tauri-auth] Cold start deep link:", urls[0])
			handleUrl(urls[0])
		}
	} catch (e) {
		console.error("[tauri-auth] Failed to get current deep link:", e)
	}

	// Listen for warm start deep links (app already running)
	try {
		await deepLink.onOpenUrl((urls) => {
			if (urls[0]) {
				console.log("[tauri-auth] Warm start deep link:", urls[0])
				handleUrl(urls[0])
			}
		})
	} catch (e) {
		console.error("[tauri-auth] Failed to register deep link listener:", e)
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
 * - Dev mode: Starts local server to capture OAuth callback
 * - Prod mode: Uses deep links for callback
 */
export const initiateDesktopAuth = async (options: DesktopAuthOptions = {}): Promise<void> => {
	if (!opener) throw new Error("Tauri opener not available")

	const backendUrl = import.meta.env.VITE_BACKEND_URL
	const isDev = import.meta.env.DEV
	const returnTo = options.returnTo || "/"

	console.log("[tauri-auth] Initiating desktop auth flow, isDev:", isDev)

	let code: string
	let state: string

	if (isDev) {
		// DEV MODE: Use localhost OAuth server on fixed port
		if (!core || !event) throw new Error("Tauri core/event not available")

		// Start local OAuth server (returns fixed port 17927)
		const port = await core.invoke<number>("start_oauth_server")
		const redirectUri = `http://127.0.0.1:${port}`
		console.log("[tauri-auth] OAuth server started on port:", port)

		// Set up listener for OAuth callback with proper cleanup
		// Using object wrapper to avoid TypeScript flow analysis narrowing issues
		const cleanup = {
			unlisten: null as (() => void) | null,
			timeoutId: null as ReturnType<typeof setTimeout> | null,
		}

		const callbackPromise = new Promise<string>((resolve, reject) => {
			cleanup.timeoutId = setTimeout(() => {
				reject(new Error("OAuth callback timeout after 2 minutes"))
			}, 120000)

			// Set up listener - must be done inside promise to capture resolve/reject
			event
				.listen<string>("oauth-callback", (evt) => {
					if (cleanup.timeoutId) clearTimeout(cleanup.timeoutId)
					console.log("[tauri-auth] Received OAuth callback:", evt.payload)
					resolve(evt.payload)
				})
				.then((unlistenFn) => {
					cleanup.unlisten = unlistenFn
				})
		})

		// Build login URL with redirect URI
		const loginUrl = new URL("/auth/login/desktop", backendUrl)
		loginUrl.searchParams.set("returnTo", returnTo)
		loginUrl.searchParams.set("redirectUri", redirectUri)
		if (options.organizationId) {
			loginUrl.searchParams.set("organizationId", options.organizationId)
		}
		if (options.invitationToken) {
			loginUrl.searchParams.set("invitationToken", options.invitationToken)
		}

		console.log("[tauri-auth] Opening URL:", loginUrl.toString())

		// Open system browser for OAuth
		await opener.openUrl(loginUrl.toString())
		console.log("[tauri-auth] Browser opened, waiting for callback...")

		// Wait for OAuth callback with cleanup
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
	} else {
		// PROD MODE: Use deep links
		const callbackPromise = new Promise<AuthCallbackParams>((resolve, reject) => {
			// Add timeout to match dev mode (2 minutes)
			const timeoutId = setTimeout(() => {
				deepLinkResolver = null
				reject(new Error("OAuth callback timeout after 2 minutes"))
			}, 120000)

			deepLinkResolver = (params) => {
				clearTimeout(timeoutId)
				resolve(params)
			}
		})

		// Build login URL (no redirectUri = backend uses hazel://auth/callback)
		const loginUrl = new URL("/auth/login/desktop", backendUrl)
		loginUrl.searchParams.set("returnTo", returnTo)
		// Don't set redirectUri - backend will use default hazel://auth/callback
		if (options.organizationId) {
			loginUrl.searchParams.set("organizationId", options.organizationId)
		}
		if (options.invitationToken) {
			loginUrl.searchParams.set("invitationToken", options.invitationToken)
		}

		console.log("[tauri-auth] Opening URL:", loginUrl.toString())

		// Open system browser for OAuth
		await opener.openUrl(loginUrl.toString())
		console.log("[tauri-auth] Browser opened, waiting for deep link callback...")

		// Wait for deep link callback
		const result = await callbackPromise
		code = result.code
		state = result.state
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
