import { ConfigProvider, Effect, Exit, Layer, Redacted } from "effect"
import { describe, expect, test } from "vitest"
import { AccessTokenVerifier, generateSigningKey, makeIssuer, publicJwk } from "./access-token.ts"
import { CryptoLive } from "./server.ts"

/** The verifier the Electric proxy and actors use, configured as they are on a stage. */

const api = "https://api.hazel.test"
const userId = "00000000-0000-4000-8000-000000000001"

const keyPair = async (kid: string) => {
	const pair = await Effect.runPromise(generateSigningKey(kid).pipe(Effect.provide(CryptoLive)))
	return { kid, privateJwk: pair.privateKey }
}

const mint = async (issuer: string, key: Awaited<ReturnType<typeof keyPair>>) => {
	const tokens = await Effect.runPromise(makeIssuer(issuer, key).pipe(Effect.provide(CryptoLive)))
	const token = await Effect.runPromise(
		tokens.mint({ subjectId: userId, sessionId: "s1" }).pipe(Effect.provide(CryptoLive)),
	)
	return Redacted.value(token)
}

const verify = async (token: string, key: Awaited<ReturnType<typeof keyPair>>) => {
	const jwk = await Effect.runPromise(publicJwk(key).pipe(Effect.provide(CryptoLive)))
	const config = ConfigProvider.layer(
		ConfigProvider.fromUnknown({
			API_BASE_URL: api,
			AUTH_ACCESS_TOKEN_JWKS: JSON.stringify({ keys: [jwk] }),
		}),
	)
	return Effect.runPromiseExit(
		Effect.gen(function* () {
			const verifier = yield* AccessTokenVerifier
			return yield* verifier.verify(token)
		}).pipe(Effect.provide(AccessTokenVerifier.layer.pipe(Layer.provide(config)))),
	)
}

const failureTag = (exit: Exit.Exit<unknown, { readonly _tag: string }>) =>
	Exit.isFailure(exit)
		? exit.cause.reasons.map((reason) => ("error" in reason ? reason.error._tag : reason._tag))
		: []

describe("AccessTokenVerifier", () => {
	test("a token the API minted resolves to its user", async () => {
		const key = await keyPair("k1")
		const exit = await verify(await mint(api, key), key)
		expect(exit).toEqual(Exit.succeed({ userId, sessionId: "s1" }))
	})

	test("another stage's token is rejected", async () => {
		const key = await keyPair("k1")
		const exit = await verify(await mint("https://api.other.test", key), key)
		expect(failureTag(exit)).toEqual(["AccessTokenInvalid"])
	})

	test("a token signed with another key is rejected", async () => {
		const exit = await verify(await mint(api, await keyPair("k1")), await keyPair("k1"))
		expect(failureTag(exit)).toEqual(["AccessTokenInvalid"])
	})
})

test("malformed inline key JSON is a typed, secret-free configuration error", async () => {
	const exit = await Effect.runPromiseExit(
		Effect.service(AccessTokenVerifier).pipe(
			Effect.provide(AccessTokenVerifier.layer),
			Effect.provide(
				ConfigProvider.layer(
					ConfigProvider.fromUnknown({
						API_BASE_URL: api,
						AUTH_ACCESS_TOKEN_JWKS: "sensitive-invalid-key-json",
					}),
				),
			),
		),
	)
	expect(failureTag(exit)).toEqual(["AccessTokenConfigurationError"])
	expect(JSON.stringify(exit)).not.toContain("sensitive-invalid-key-json")
})
