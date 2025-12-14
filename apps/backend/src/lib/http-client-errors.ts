import type { HttpApiError, HttpClientError } from "@effect/platform"
import { InternalServerError } from "@hazel/domain"
import { Effect, type ParseResult } from "effect"

// Type for HTTP client errors that should be remapped
type HttpClientErrors =
	| HttpApiError.HttpApiDecodeError
	| ParseResult.ParseError
	| HttpClientError.RequestError
	| HttpClientError.ResponseError

/**
 * Helper to remap HTTP client errors (from HttpApiClient) to InternalServerError.
 * Use this when calling external services via HttpApiClient.
 *
 * @param message - The error message to use
 * @returns An Effect operator that remaps HTTP client errors
 *
 * @example
 * ```ts
 * yield* client.workflows.SomeWorkflow({ payload }).pipe(
 *   Effect.tapError((err) => Effect.logError("...", { error: err.message })),
 *   remapHttpClientErrors("Failed to execute workflow"),
 * )
 * ```
 */
export const remapHttpClientErrors =
	(message: string) =>
	<A, R>(self: Effect.Effect<A, HttpClientErrors, R>): Effect.Effect<A, InternalServerError, R> =>
		self.pipe(Effect.catchAll(() => Effect.fail(new InternalServerError({ message }))))
