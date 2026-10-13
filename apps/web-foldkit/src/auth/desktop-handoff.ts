import { desktopLogin } from "@hazel/auth/contract"
import { OperationHttpClient } from "@yielded/auth"
import { Effect, Layer, Redacted, Schema } from "effect"
import { FetchHttpClient } from "effect/http"
import { HazelAuthClient } from "./client"

/**
 * The browser half of desktop sign-in: describe the desktop app's attempt, then authorize it
 * with this browser's session. The desktop app receives the callback and makes its own session.
 */

/** The handoff routes take the browser's session cookie, never a redirect. */
const TransportLive = OperationHttpClient.layer({
	baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
	csrfHeader: "x-effect-auth-csrf",
	csrfValue: "1",
}).pipe(
	Layer.provide(FetchHttpClient.layer),
	Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include", redirect: "error" })),
	Layer.orDie,
)

export class HandoffError extends Schema.TaggedError<HandoffError>()("HandoffError", {
	message: Schema.String,
}) {}

const failed = (error: { readonly _tag: string }) =>
	new HandoffError({
		message:
			error._tag === "OperationHttpError"
				? "Couldn't reach Hazel. Check your connection and try again."
				: "This sign-in request has expired or was already used. Start again from the desktop app.",
	})

/** The app asking to sign in (`displayName`), or a failure if the attempt is gone. */
export const describeAttempt = (attemptId: string) =>
	Effect.gen(function* () {
		const transport = yield* OperationHttpClient.Client
		return yield* transport.call(desktopLogin.routes.describe, { attemptId })
	}).pipe(Effect.mapError(failed), Effect.provide(TransportLive))

/** Authorizes the attempt for this browser's session and returns the app's callback URL. */
export const authorizeAttempt = (attemptId: string) =>
	Effect.gen(function* () {
		const client = yield* HazelAuthClient
		const session = yield* client.auth.getSession()
		if (session === null) return yield* new HandoffError({ message: "Sign in first, then continue." })
		const transport = yield* OperationHttpClient.Client
		const result = yield* transport.call(desktopLogin.routes.authorize, {
			attemptId,
			decision: "continue",
			expectedSessionId: session.sessionId,
		})
		return Redacted.value(result.callbackUrl)
	}).pipe(
		Effect.catchIf(
			(error) => error._tag !== "HandoffError",
			(error) => Effect.fail(failed(error)),
		),
		Effect.provide(TransportLive),
	)
