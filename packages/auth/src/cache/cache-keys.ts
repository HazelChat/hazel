import { Duration } from "effect"

/**
 * Prefix for session cache keys in Redis
 */
export const SESSION_CACHE_PREFIX = "auth:session"

/**
 * Default TTL for cached sessions (30 seconds)
 */
export const DEFAULT_CACHE_TTL = Duration.seconds(30)

/**
 * Minimum TTL - don't cache if session expires sooner than this
 */
export const MIN_CACHE_TTL_SECONDS = 10

/**
 * Generate a cache key for a session cookie.
 * Uses SHA-256 hash of the cookie to avoid key size issues and ensure consistent keys.
 */
export const sessionCacheKey = async (sessionCookie: string): Promise<string> => {
	const encoder = new TextEncoder()
	const data = encoder.encode(sessionCookie)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
	return `${SESSION_CACHE_PREFIX}:${hash}`
}

/**
 * Calculate the appropriate cache TTL based on session expiry.
 * Returns 0 if the session expires too soon to be worth caching.
 */
export const calculateCacheTtl = (expiresAt: number): Duration.Duration => {
	const now = Math.floor(Date.now() / 1000)
	const secondsUntilExpiry = expiresAt - now

	// Don't cache if token expires very soon
	if (secondsUntilExpiry < MIN_CACHE_TTL_SECONDS) {
		return Duration.zero
	}

	// Use shorter TTL if token expires soon
	if (secondsUntilExpiry < 60) {
		return Duration.seconds(Math.min(secondsUntilExpiry - 5, 5))
	}

	// Standard 30-second cache for healthy sessions
	return DEFAULT_CACHE_TTL
}
