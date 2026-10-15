/**
 * Short-lived access token for the hosts that cannot see the API's session cookie
 * (the Electric proxy and the Rivet actors). The backend exchanges the HttpOnly session
 * cookie for an ES256 JWT at `POST /auth/token`; those hosts verify it against the API's
 * JWKS. Requests to the API itself authenticate with the cookie and need no token.
 */

import { sessionAuthorization } from "./session-bearer"

interface CachedToken {
	readonly token: string
	readonly expiresAtMs: number
}

/**
 * Dispatched on `window` when the API refuses to exchange the session for a token: the session
 * has likely ended. The app re-reads the session and, if it has, sends the user to sign-in.
 */
export const SESSION_REJECTED_EVENT = "hazel:session-rejected"

/** Renew this long before expiry, so a token is never sent seconds from expiring. */
const RENEW_BEFORE_MS = 60_000

let generation = 0
let cached: CachedToken | null = null
let pending: Promise<string | null> | null = null

const backendUrl = () => import.meta.env.VITE_BACKEND_URL || "http://localhost:3003"

const isTokenResponse = (value: unknown): value is { token: string; expiresIn: number } =>
	typeof value === "object" &&
	value !== null &&
	"token" in value &&
	typeof value.token === "string" &&
	"expiresIn" in value &&
	typeof value.expiresIn === "number"

/** Attempts per exchange: a network error or 5xx right after sign-in is usually momentary. */
const EXCHANGE_ATTEMPTS = 3

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** `null` means the API answered and there is no session; `"retry"` means it could not answer. */
const exchangeOnce = async (startedGeneration: number): Promise<string | null | "retry"> => {
	try {
		const authorization = await sessionAuthorization()
		const response = await fetch(`${backendUrl()}/auth/token`, {
			method: "POST",
			// The desktop app's session is a bearer; a browser's is the API's cookie.
			...(authorization === null
				? { credentials: "include" as const, headers: { "x-effect-auth-csrf": "1" } }
				: { credentials: "omit" as const, headers: { authorization } }),
		})
		if (startedGeneration !== generation) return null
		if (response.status >= 500) return "retry"
		if (!response.ok) {
			cached = null
			if (response.status === 401) window.dispatchEvent(new Event(SESSION_REJECTED_EVENT))
			return null
		}
		const body: unknown = await response.json()
		if (startedGeneration !== generation || !isTokenResponse(body)) return null
		cached = { token: body.token, expiresAtMs: Date.now() + body.expiresIn * 1000 }
		return body.token
	} catch {
		return "retry"
	}
}

const exchange = async (startedGeneration: number): Promise<string | null> => {
	for (let attempt = 1; ; attempt++) {
		const result = await exchangeOnce(startedGeneration)
		if (result !== "retry") return result
		if (attempt >= EXCHANGE_ATTEMPTS || startedGeneration !== generation) return null
		await sleep(250 * 2 ** attempt)
	}
}

/** The current access token, exchanged again shortly before it expires; `null` when signed out. */
export const getAccessToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") return null
	if (cached !== null && cached.expiresAtMs - Date.now() > RENEW_BEFORE_MS) return cached.token
	if (pending === null) {
		const request = exchange(generation).finally(() => {
			if (pending === request) pending = null
		})
		pending = request
	}
	return pending
}

/** Forgets the cached token so the next request exchanges a new one, after a host rejected it. */
export const invalidateAccessToken = (rejected: string) => {
	if (cached?.token === rejected) cached = null
}

/** Drops the cached token, for sign-out. */
export const clearAccessToken = () => {
	generation++
	pending = null
	cached = null
}
