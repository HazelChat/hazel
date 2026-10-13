import { Effect, Schedule, Schema } from "effect"
import { clearAccessToken } from "~/lib/access-token"
import { HazelAuthClient } from "../auth/client"
import { isDesktop } from "../platform/desktop"
import { runDesktopAuth } from "../platform/desktop-auth"
import type { Auth } from "../session"

/**
 * The Hazel session, read from the API. In a browser it is an HttpOnly cookie on the API host
 * (`getSession`); the desktop app holds its own session in the OS keychain.
 */

/** Retried while the API is unreachable; auth stays `Loading` (the app loader) meanwhile. */
const retryUnavailable = Schedule.min([
	Schedule.exponential("500 millis").pipe(Schedule.jittered),
	Schedule.spaced("30 seconds"),
])

/** The desktop app's own session (OS keychain), checked with the API. */
const readDesktopSession = runDesktopAuth((auth) => auth.session).pipe(
	Effect.map((session): Auth => (session === null ? "SignedOut" : "SignedIn")),
)

const readBrowserSession = Effect.gen(function* () {
	const client = yield* HazelAuthClient
	const session = yield* client.auth.getSession()
	return session === null ? ("SignedOut" as const) : ("SignedIn" as const)
})

const read: Effect.Effect<Auth, unknown, HazelAuthClient> = isDesktop
	? readDesktopSession
	: readBrowserSession

export const readSession: Effect.Effect<Auth, never, HazelAuthClient> = read.pipe(
	Effect.tapError((error) => Effect.logWarning("[auth] session check failed", error)),
	Effect.retry({ schedule: retryUnavailable, times: 3 }),
	Effect.orElseSucceed(() => "SignedOut" as const),
)

/** The API rejected sign-out or could not be reached; the user stays signed in. */
export class SignOutError extends Schema.TaggedError<SignOutError>()("SignOutError", {
	message: Schema.String,
}) {}

/** Ends the session on the API, then reloads `/`, which sends the browser to sign-in. */
export const signOut: Effect.Effect<void, SignOutError, HazelAuthClient> = Effect.gen(function* () {
	if (isDesktop) {
		// Ends only the desktop app's session; the browser it signed in with stays signed in.
		yield* runDesktopAuth((auth) => auth.signOut).pipe(
			Effect.mapError((error) => new SignOutError({ message: error._tag })),
		)
	} else {
		const client = yield* HazelAuthClient
		yield* client.auth
			.signOut()
			.pipe(Effect.mapError((error) => new SignOutError({ message: error._tag })))
	}
	clearAccessToken()
	yield* Effect.sync(() => window.location.assign("/"))
})
