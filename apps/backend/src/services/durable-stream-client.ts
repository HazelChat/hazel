/**
 * Durable Stream Client Service
 *
 * HTTP client for publishing events to the durable stream server.
 */
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"

/**
 * Configuration for the durable stream client
 */
export interface DurableStreamClientConfig {
	readonly baseUrl: string
	readonly serviceToken: Redacted.Redacted<string>
}

export class DurableStreamClientConfigTag extends Context.Tag("@hazel/backend/DurableStreamClientConfig")<
	DurableStreamClientConfigTag,
	DurableStreamClientConfig
>() {}

/**
 * Error thrown when durable stream operations fail
 */
export class DurableStreamError extends Schema.TaggedError<DurableStreamError>()("DurableStreamError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Durable Stream Client Service
 *
 * Provides methods for publishing events to durable streams.
 */
export class DurableStreamClient extends Effect.Service<DurableStreamClient>()("DurableStreamClient", {
	accessors: true,
	dependencies: [FetchHttpClient.layer],
	effect: Effect.gen(function* () {
		const config = yield* DurableStreamClientConfigTag
		const httpClient = yield* HttpClient.HttpClient

		/**
		 * Create a stream if it doesn't exist
		 */
		const ensureStream = (path: string) =>
			Effect.gen(function* () {
				const url = `${config.baseUrl}${path}`
				const request = HttpClientRequest.put(url).pipe(
					HttpClientRequest.setHeader(
						"Authorization",
						`Bearer ${Redacted.value(config.serviceToken)}`,
					),
					HttpClientRequest.setHeader("Content-Type", "application/json"),
				)

				const response = yield* httpClient.execute(request).pipe(
					Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Unknown)),
					Effect.catchTags({
						RequestError: () => Effect.succeed(null),
						ResponseError: () => Effect.succeed(null),
						ParseError: () => Effect.succeed(null),
					}),
				)

				return response
			})

		/**
		 * Publish an event to a stream
		 */
		const publish = (path: string, event: unknown) =>
			Effect.gen(function* () {
				// First ensure the stream exists
				yield* ensureStream(path)

				// Then post the event
				const url = `${config.baseUrl}${path}`
				const body = JSON.stringify(event)

				const request = HttpClientRequest.post(url).pipe(
					HttpClientRequest.setHeader(
						"Authorization",
						`Bearer ${Redacted.value(config.serviceToken)}`,
					),
					HttpClientRequest.setHeader("Content-Type", "application/json"),
					HttpClientRequest.bodyText(body),
				)

				const response = yield* httpClient.execute(request).pipe(
					Effect.catchTag("RequestError", (error) =>
						Effect.fail(
							new DurableStreamError({
								message: "Failed to connect to durable stream server",
								cause: error,
							}),
						),
					),
					Effect.catchTag("ResponseError", (error) =>
						Effect.fail(
							new DurableStreamError({
								message: `Durable stream server returned error: ${error.response.status}`,
								cause: error,
							}),
						),
					),
				)

				// Check for success (2xx status)
				if (response.status >= 400) {
					return yield* Effect.fail(
						new DurableStreamError({
							message: `Durable stream server returned status ${response.status}`,
						}),
					)
				}

				return response
			}).pipe(Effect.withSpan("durable-stream.publish", { attributes: { path } }))

		/**
		 * Publish a bot command event
		 */
		const publishBotCommand = (botId: string, event: unknown) =>
			publish(`/bots/${botId}/commands`, event).pipe(
				Effect.withSpan("durable-stream.publishBotCommand", { attributes: { botId } }),
			)

		return {
			publish,
			publishBotCommand,
			ensureStream,
		}
	}),
}) {}

/**
 * Default layer that reads config from environment
 */
export const DurableStreamClientLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const baseUrl = yield* Config.string("DURABLE_STREAM_URL").pipe(
			Config.withDefault("http://localhost:4437"),
		)
		const serviceToken = yield* Config.redacted("STREAM_SERVICE_TOKEN")

		return DurableStreamClient.Default.pipe(
			Layer.provide(
				Layer.succeed(DurableStreamClientConfigTag, {
					baseUrl,
					serviceToken,
				}),
			),
		)
	}),
)
