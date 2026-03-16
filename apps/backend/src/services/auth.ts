import { CurrentUser } from "@hazel/domain"
import { Effect, Layer, Redacted } from "effect"
import { SessionManager } from "./session-manager"

export const AuthorizationLive = Layer.effect(
	CurrentUser.Authorization,
	Effect.gen(function* () {
		yield* Effect.logDebug("Initializing Authorization middleware...")

		const sessionManager = yield* SessionManager

		return CurrentUser.Authorization.of({
			bearer: (httpEffect, { credential: bearerToken }) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("checking bearer token")

					// Use SessionManager to handle bearer token authentication
					const user = yield* sessionManager.authenticateWithBearer(Redacted.value(bearerToken))
					return yield* Effect.provideService(httpEffect, CurrentUser.Context, user)
				}),
		})
	}),
)
