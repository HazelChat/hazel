/**
 * Authenticated fetch client for Electric SQL with exponential backoff retry.
 *
 * Uses Clerk's session token on web. `getClerkToken` waits for Clerk to finish
 * loading, so there's no synchronous gate and no race against ClerkProvider
 * hydration. 5xx errors retry with jittered exponential backoff so the proxy
 * isn't hammered during outages.
 */
import { Effect, Schedule } from "effect"
import { getClerkToken } from "./clerk-token"
import { runtime } from "./services/common/runtime"
import { isTauri } from "./tauri"

const retrySchedule = Schedule.exponential("2 seconds").pipe(
	Schedule.jittered,
	Schedule.either(Schedule.spaced("60 seconds")),
	Schedule.compose(Schedule.recurs(8)),
)

const shouldRetry = (response: Response): boolean =>
	response.status >= 500 && response.status < 600

const doFetch = async (input: RequestInfo | URL, init: RequestInit | undefined): Promise<Response> => {
	// Desktop still uses the legacy flow — out of scope for the Clerk migration.
	if (isTauri()) {
		return fetch(input, init)
	}

	const token = await getClerkToken()
	if (!token) return new Response(null, { status: 401 })

	return fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` },
	})
}

export const electricFetchClient = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const fetchEffect = Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: () => doFetch(input, init),
			catch: (error) => error as Error,
		})
		if (shouldRetry(response)) return yield* Effect.fail(response)
		return response
	})

	const withRetry = fetchEffect.pipe(
		Effect.retry({
			schedule: retrySchedule,
			while: (error) => error instanceof Response && shouldRetry(error),
		}),
		Effect.catch((error) => (error instanceof Response ? Effect.succeed(error) : Effect.fail(error))),
	)

	return runtime.runPromise(withRetry) as Promise<Response>
}
