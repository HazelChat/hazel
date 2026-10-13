/**
 * Short-lived access token for the hosts that cannot see the API's session cookie
 * (the Electric proxy and the Rivet actors). The backend exchanges the HttpOnly session
 * cookie for an ES256 JWT at `POST /auth/token`; those hosts verify it against the API's
 * JWKS. Requests to the API itself authenticate with the cookie and need no token.
 */

interface CachedToken {
	readonly token: string
	readonly expiresAtMs: number
}

/** Renew this long before expiry, so a token is never sent seconds from expiring. */
const RENEW_BEFORE_MS = 60_000

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

const exchange = async (): Promise<string | null> => {
	try {
		const response = await fetch(`${backendUrl()}/auth/token`, {
			method: "POST",
			credentials: "include",
		})
		if (!response.ok) {
			cached = null
			return null
		}
		const body: unknown = await response.json()
		if (!isTokenResponse(body)) return null
		cached = { token: body.token, expiresAtMs: Date.now() + body.expiresIn * 1000 }
		return body.token
	} catch {
		return null
	}
}

/** The current access token, exchanged again shortly before it expires; `null` when signed out. */
export const getAccessToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") return null
	if (cached !== null && cached.expiresAtMs - Date.now() > RENEW_BEFORE_MS) return cached.token
	pending ??= exchange().finally(() => {
		pending = null
	})
	return pending
}

/** Drops the cached token, for sign-out. */
export const clearAccessToken = () => {
	cached = null
}
