import { BotGatewayEnvelope } from "@hazel/domain"
import type { BotId } from "@hazel/schema"
import { Context, Effect, Layer, Ref, Schema } from "effect"
import { GatewayDecodeError, GatewayReadError, GatewaySessionStoreError } from "./errors.ts"

export type GatewayTransport = "auto" | "live" | "pull"

export interface GatewaySessionStore {
	load(botId: BotId): Effect.Effect<string | null, GatewaySessionStoreError>
	save(botId: BotId, offset: string): Effect.Effect<void, GatewaySessionStoreError>
}

export const GatewaySessionStoreTag =
	Context.GenericTag<GatewaySessionStore>("@hazel/bot-sdk/GatewaySessionStore")

export const InMemoryGatewaySessionStoreLive = Layer.effect(
	GatewaySessionStoreTag,
	Effect.gen(function* () {
		const offsetsRef = yield* Ref.make(new Map<BotId, string>())

		return {
			load: (botId) =>
				Ref.get(offsetsRef).pipe(
					Effect.map((offsets) => offsets.get(botId) ?? null),
					Effect.mapError(
						(cause) =>
							new GatewaySessionStoreError({
								message: `Failed to load resume offset for bot ${botId}`,
								cause,
							}),
					),
				),

			save: (botId, offset) =>
				Ref.update(offsetsRef, (offsets) => {
					const next = new Map(offsets)
					next.set(botId, offset)
					return next
				}).pipe(
					Effect.mapError(
						(cause) =>
							new GatewaySessionStoreError({
								message: `Failed to save resume offset for bot ${botId}`,
								cause,
							}),
					),
				),
		} satisfies GatewaySessionStore
	}),
)

export interface GatewayBatch {
	readonly events: ReadonlyArray<Schema.Schema.Type<typeof BotGatewayEnvelope>>
	readonly nextOffset: string
}

export const readGatewayBatch = Effect.fn("Gateway.readBatch")(function* (params: {
	readonly gatewayUrl: string
	readonly botToken: string
	readonly offset: string
	readonly transport: GatewayTransport
}) {
	const requestUrl = new URL("/bot-gateway/stream", params.gatewayUrl)
	requestUrl.searchParams.set("offset", params.offset)
	if (params.transport !== "pull") {
		requestUrl.searchParams.set("live", "long-poll")
	}

	const response = yield* Effect.tryPromise({
		try: () =>
			fetch(requestUrl.toString(), {
				method: "GET",
				headers: {
					Authorization: `Bearer ${params.botToken}`,
					Accept: "application/json",
				},
			}),
		catch: (cause) =>
			new GatewayReadError({
				message: `Failed to read bot gateway stream`,
				cause,
			}),
	})

	if (!response.ok) {
		const detail = yield* Effect.tryPromise({
			try: () => response.text(),
			catch: () => `${response.status} ${response.statusText}`,
		})
		return yield* Effect.fail(
			new GatewayReadError({
				message: `Bot gateway read failed with status ${response.status}: ${detail}`,
				cause: response.status,
			}),
		)
	}

	const nextOffset = response.headers.get("Stream-Next-Offset") ?? params.offset
	const payload = yield* Effect.tryPromise({
		try: () => response.text(),
		catch: (cause) =>
			new GatewayReadError({
				message: "Failed to read bot gateway response body",
				cause,
			}),
	})

	if (payload.trim().length === 0) {
		return {
			events: [],
			nextOffset,
		} satisfies GatewayBatch
	}

	const rawEvents = yield* Effect.try({
		try: () => JSON.parse(payload) as unknown,
		catch: (cause) =>
			new GatewayDecodeError({
				message: "Failed to parse bot gateway response as JSON",
				payload,
				cause,
			}),
	})

	const events = yield* Schema.decodeUnknown(Schema.Array(BotGatewayEnvelope))(rawEvents).pipe(
		Effect.mapError(
			(cause) =>
				new GatewayDecodeError({
					message: "Failed to decode bot gateway events",
					payload,
					cause,
				}),
		),
	)

	return {
		events,
		nextOffset,
	} satisfies GatewayBatch
})
