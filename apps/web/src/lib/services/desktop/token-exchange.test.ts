import { FetchHttpClient } from "effect/unstable/http"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Effect, Layer } from "effect"
import { OAuthRedemptionPendingError, OAuthStateMismatchError } from "@hazel/domain/errors"
import { TokenExchange } from "./token-exchange"

const makeTokenExchangeLayer = (fetchImpl: typeof fetch) =>
	Layer.effect(TokenExchange, TokenExchange.make).pipe(
		Layer.provide(FetchHttpClient.layer),
		Layer.provide(Layer.succeed(FetchHttpClient.Fetch, fetchImpl)),
	)

const runExchange = (fetchImpl: typeof fetch, attemptId = "attempt_test_123") =>
	Effect.runPromise(
		Effect.gen(function* () {
			const tokenExchange = yield* TokenExchange
			return yield* tokenExchange.exchangeCode(
				"code_123",
				JSON.stringify({ returnTo: "/inbox" }),
				attemptId,
			)
		}).pipe(Effect.provide(makeTokenExchangeLayer(fetchImpl))),
	)

const runRefresh = (fetchImpl: typeof fetch, attemptId = "attempt_refresh_123") =>
	Effect.runPromise(
		Effect.gen(function* () {
			const tokenExchange = yield* TokenExchange
			return yield* tokenExchange.refreshToken("refresh_123", attemptId)
		}).pipe(Effect.provide(makeTokenExchangeLayer(fetchImpl))),
	)

describe("TokenExchange", () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("uses the generated auth client and sends the typed attempt header for token exchange", async () => {
		const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = input instanceof Request ? input : new Request(input, init)
			expect(request.method).toBe("POST")
			expect(new URL(request.url).pathname).toBe("/auth/token")
			expect(request.headers.get("x-auth-attempt-id")).toBe("attempt_test_123")
			expect(await request.json()).toEqual({
				code: "code_123",
				state: JSON.stringify({ returnTo: "/inbox" }),
			})

			return new Response(
				JSON.stringify({
					accessToken: "access_token",
					refreshToken: "refresh_token",
					expiresIn: 3600,
					user: {
						id: "user_123",
						email: "test@example.com",
						firstName: "Test",
						lastName: "User",
					},
				}),
				{
					status: 200,
					headers: { "content-type": "application/json" },
				},
			)
		})

		const response = await runExchange(fetchMock as typeof fetch)

		expect(response.accessToken).toBe("access_token")
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it("decodes typed auth errors from the generated auth client", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						_tag: "OAuthStateMismatchError",
						message: "state mismatch",
					}),
					{
						status: 400,
						headers: { "content-type": "application/json" },
					},
				),
		)

		const error = await runExchange(fetchMock as typeof fetch).catch((caught) => caught)

		expect(error).toBeInstanceOf(OAuthStateMismatchError)
		expect(error).toEqual(
			new OAuthStateMismatchError({
				message: "state mismatch",
			}),
		)
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it("sends the typed attempt header for refresh requests", async () => {
		const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = input instanceof Request ? input : new Request(input, init)
			expect(request.method).toBe("POST")
			expect(new URL(request.url).pathname).toBe("/auth/refresh")
			expect(request.headers.get("x-auth-attempt-id")).toBe("attempt_refresh_123")
			expect(await request.json()).toEqual({
				refreshToken: "refresh_123",
			})

			return new Response(
				JSON.stringify({
					accessToken: "access_token",
					refreshToken: "refresh_token",
					expiresIn: 3600,
				}),
				{
					status: 200,
					headers: { "content-type": "application/json" },
				},
			)
		})

		const response = await runRefresh(fetchMock as typeof fetch)

		expect(response.refreshToken).toBe("refresh_token")
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it("preserves pending-redemption errors as typed failures", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						_tag: "OAuthRedemptionPendingError",
						message: "try again shortly",
					}),
					{
						status: 503,
						headers: { "content-type": "application/json" },
					},
				),
		)

		const error = await runExchange(fetchMock as typeof fetch).catch((caught) => caught)

		expect(error).toBeInstanceOf(OAuthRedemptionPendingError)
		expect(error).toEqual(
			new OAuthRedemptionPendingError({
				message: "try again shortly",
			}),
		)
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})
})
