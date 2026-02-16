/**
 * Authenticated fetch client for Electric SQL with exponential backoff retry.
 *
 * Handles both Tauri desktop (Bearer token) and web (cookies) authentication.
 * Retries 5xx server errors with exponential backoff to prevent overwhelming
 * the Electric proxy during outages.
 */
import { Effect, Schedule } from "effect"
import { authenticatedFetch } from "./auth-fetch"
import { runtime } from "./services/common/runtime"
import { isTauri } from "./tauri"

const ACCESS_TOKEN_KEY = "hazel_auth_access_token"

/**
 * Synchronous check for auth token availability.
 * On web, checks localStorage directly. On Tauri, skips the check
 * since tokens are in an async store handled by authenticatedFetch.
 */
const hasAuthToken = (): boolean => {
	if (isTauri()) return true
	if (typeof window === "undefined" || !window.localStorage) return false
	return window.localStorage.getItem(ACCESS_TOKEN_KEY) !== null
}

/**
 * Retry schedule for Electric fetch:
 * - Exponential backoff starting at 2 seconds
 * - Max delay capped at 60 seconds
 * - Jitter to spread out retries (prevents thundering herd)
 * - Max 8 retries
 */
const retrySchedule = Schedule.exponential("2 seconds").pipe(
	Schedule.jittered,
	Schedule.either(Schedule.spaced("60 seconds")),
	Schedule.upTo(8),
)

/**
 * Check if response status warrants a retry (5xx server errors only)
 */
const shouldRetry = (response: Response): boolean => response.status >= 500 && response.status < 600

/**
 * Electric fetch client with exponential backoff retry for server errors.
 * - Retries 5xx errors with exponential backoff (2s → 4s → 8s... up to 60s)
 * - Does NOT retry 4xx client errors (auth, validation, etc.)
 * - Uses jitter to prevent thundering herd
 */
export const electricFetchClient = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	if (!hasAuthToken()) {
		return new Response(null, { status: 401 })
	}

	const fetchEffect = Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: () => authenticatedFetch(input, init),
			catch: (error) => error as Error,
		})

		// If server error, fail the effect to trigger retry
		if (shouldRetry(response)) {
			return yield* Effect.fail(response)
		}

		return response
	})

	// Retry only on server errors (when effect fails with Response)
	const withRetry = fetchEffect.pipe(
		Effect.retry({
			schedule: retrySchedule,
			while: (error) => error instanceof Response && shouldRetry(error),
		}),
		// If all retries exhausted, return the last failed response
		Effect.catchAll((error) => (error instanceof Response ? Effect.succeed(error) : Effect.fail(error))),
	)

	return runtime.runPromise(withRetry)
}
