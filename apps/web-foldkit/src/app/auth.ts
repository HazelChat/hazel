import { Effect, Schedule, Schema } from "effect"
import { clearAccessToken } from "~/lib/access-token"
import { HazelAuthClient } from "../auth/client"
import type { Auth } from "../session"

/**
 * The browser's Hazel session, read from the API (`getSession`). The session itself is an
 * HttpOnly cookie on the API host, so the app only learns whether one is valid.
 */

/** Retried while the API is unreachable; auth stays `Loading` (the app loader) meanwhile. */
const retryUnavailable = Schedule.min([
	Schedule.exponential("500 millis").pipe(Schedule.jittered),
	Schedule.spaced("30 seconds"),
])

export const readSession: Effect.Effect<Auth, never, HazelAuthClient> = Effect.gen(function* () {
	const client = yield* HazelAuthClient
	const session = yield* client.auth.getSession()
	return session === null ? "SignedOut" : "SignedIn"
}).pipe(
	Effect.tapError((error) => Effect.logWarning("[auth] session check failed", error)),
	Effect.retry(retryUnavailable),
	Effect.orDie,
)

/** The API rejected sign-out or could not be reached; the user stays signed in. */
export class SignOutError extends Schema.TaggedError<SignOutError>()("SignOutError", {
	message: Schema.String,
}) {}

/** Ends the session on the API, then reloads `/`, which sends the browser to sign-in. */
export const signOut: Effect.Effect<void, SignOutError, HazelAuthClient> = Effect.gen(function* () {
	const client = yield* HazelAuthClient
	yield* client.auth.signOut().pipe(Effect.mapError((error) => new SignOutError({ message: error._tag })))
	clearAccessToken()
	yield* Effect.sync(() => window.location.assign("/"))
})
