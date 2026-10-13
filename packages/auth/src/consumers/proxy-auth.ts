import { UserId } from "@hazel/schema"
import { Context, Effect, Layer, Schema } from "effect"
import { AccessTokenVerifier } from "../yielded/access-token.ts"

export class ProxyAuthenticationError extends Schema.TaggedError<ProxyAuthenticationError>()(
	"ProxyAuthenticationError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

/** The API's key set could not be fetched; the request may succeed on retry. */
export class ProxyAuthUnavailableError extends Schema.TaggedError<ProxyAuthUnavailableError>()(
	"ProxyAuthUnavailableError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

const decodeUserId = Schema.decodeUnknownEffect(UserId)

/**
 * Electric-proxy authentication service.
 *
 * Verifies the Hazel access token the web app gets from `POST /auth/token`. Its subject is
 * the user's `users.id`, so no lookup is needed; the API only issues it for a live session.
 */
export class ProxyAuth extends Context.Service<ProxyAuth>()("@hazel/auth/ProxyAuth", {
	make: Effect.gen(function* () {
		const verifier = yield* AccessTokenVerifier

		const validateBearerToken = Effect.fn("ProxyAuth.validateBearerToken")(function* (
			bearerToken: string,
		) {
			const access = yield* verifier.verify(bearerToken).pipe(
				Effect.catchTags({
					AccessTokenInvalid: (error) =>
						Effect.fail(
							new ProxyAuthenticationError({
								message: "Access token verification failed",
								detail: error.reason,
							}),
						),
					AccessTokenUnavailable: (error) =>
						Effect.fail(
							new ProxyAuthUnavailableError({
								message: "Access token keys are unavailable",
								detail: error.reason,
							}),
						),
				}),
			)

			const internalUserId = yield* decodeUserId(access.userId).pipe(
				Effect.mapError(
					() => new ProxyAuthenticationError({ message: "Access token subject is not a user id" }),
				),
			)
			yield* Effect.annotateCurrentSpan("user.id", internalUserId)
			return { internalUserId }
		})

		return { validateBearerToken }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(AccessTokenVerifier.layer))
}

export const ProxyAuthLive = ProxyAuth.layer
