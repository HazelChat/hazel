import { afterAll, afterEach, beforeAll, describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Layer, Ref, Scope } from "effect"
import { delay, http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { createBotClientTag } from "./bot-client.ts"
import { Command, CommandGroup, EmptyCommandGroup } from "./command.ts"
import {
	HAZEL_SUBSCRIPTIONS,
	HazelBotClient,
	HazelBotRuntimeConfigTag,
	startBotEventPipeline,
} from "./hazel-bot-sdk.ts"
import { BotRpcClient, BotRpcClientConfigTag } from "./rpc/client.ts"
import { BotStateStoreTag, GatewaySessionStoreTag } from "./gateway.ts"
import { Schema } from "effect"

const BACKEND_URL = "http://localhost:3070"
const BOT_ID = "00000000-0000-0000-0000-000000000111"
const USER_ID = "00000000-0000-0000-0000-000000000222"
const ORG_ID = "00000000-0000-0000-0000-000000000333"
const CHANNEL_ID = "00000000-0000-0000-0000-000000000444"
const BOT_TOKEN = "test-bot-token"

const EchoCommand = Command.make("echo", {
	description: "Echo text back",
	args: { text: Schema.String },
})

const commandEnvelope = {
	schemaVersion: 1 as const,
	deliveryId: "delivery-1",
	partitionKey: `org:${ORG_ID}:channel:${CHANNEL_ID}`,
	occurredAt: 1_700_000_000_000,
	idempotencyKey: `command:${BOT_ID}:echo:${CHANNEL_ID}:1700000000000`,
	eventType: "command.invoke" as const,
	payload: {
		commandName: "echo",
		channelId: CHANNEL_ID,
		userId: USER_ID,
		orgId: ORG_ID,
		arguments: { text: "hello" },
		timestamp: 1_700_000_000_000,
	},
}

const server = setupServer()

const makeBotClientLayer = () => {
	const BotClientTag = createBotClientTag<typeof HAZEL_SUBSCRIPTIONS>()
	return {
		BotClientTag,
		layer: Layer.succeed(BotClientTag, {
			on: () => Effect.void,
			start: Effect.void as Effect.Effect<void, never, Scope.Scope>,
			getAuthContext: Effect.succeed({
				botId: BOT_ID,
				botName: "Test Bot",
				userId: USER_ID,
				channelIds: [] as readonly string[],
				token: BOT_TOKEN,
			}),
		}),
	}
}

const makeHazelBotLayer = (options: {
	sessionStore: any
	commands?: CommandGroup<any>
	gatewayTransport?: "auto" | "live" | "pull"
}) => {
	const { layer: botClientLayer } = makeBotClientLayer()

	return HazelBotClient.Default.pipe(
		Layer.provide(botClientLayer),
		Layer.provide(Layer.succeed(BotRpcClient, {} as any)),
		Layer.provide(
			Layer.succeed(BotRpcClientConfigTag, {
				backendUrl: BACKEND_URL,
				botToken: BOT_TOKEN,
			}),
		),
		Layer.provide(
			Layer.succeed(HazelBotRuntimeConfigTag, {
				backendUrl: BACKEND_URL,
				gatewayUrl: BACKEND_URL,
				botToken: BOT_TOKEN,
				commands: options.commands ?? EmptyCommandGroup,
				mentionable: false,
				actorsEndpoint: "http://localhost:6420",
				gatewayTransport: options.gatewayTransport ?? "auto",
				resumeOffset: "now",
				maxConcurrentPartitions: 2,
			}),
		),
		Layer.provide(Layer.succeed(GatewaySessionStoreTag, options.sessionStore)),
		Layer.provide(
			Layer.succeed(BotStateStoreTag, {
				get: () => Effect.succeed(null),
				set: () => Effect.void,
				delete: () => Effect.void,
			}),
		),
	)
}

describe("HazelBotClient durable gateway", () => {
	beforeAll(() => {
		server.listen({ onUnhandledRequest: "error" })
	})

	afterEach(() => {
		server.resetHandlers()
	})

	afterAll(() => {
		server.close()
	})

	it("persists the next offset only after successful command handling", () =>
		Effect.runPromise(
			Effect.gen(function* () {
				const handledArgsRef = yield* Ref.make<Array<string>>([])
				const savedOffsetsRef = yield* Ref.make<Array<string>>([])
				const queryModes: Array<string | null> = []

				server.use(
					http.post(`${BACKEND_URL}/bot-commands/sync`, async () =>
						HttpResponse.json({ syncedCount: 1 }),
					),
					http.patch(`${BACKEND_URL}/bot-commands/settings`, async () =>
						HttpResponse.json({ success: true }),
					),
					http.get(`${BACKEND_URL}/bot-gateway/stream`, async ({ request }) => {
						const url = new URL(request.url)
						const offset = url.searchParams.get("offset")
						queryModes.push(url.searchParams.get("live"))

						if (offset === "now") {
							return HttpResponse.json([commandEnvelope], {
								headers: { "Stream-Next-Offset": "1" },
							})
						}

						await delay(250)
						return HttpResponse.json([], {
							headers: { "Stream-Next-Offset": "1" },
						})
					}),
				)

				const TestLayer = makeHazelBotLayer({
					commands: CommandGroup.make(EchoCommand),
					gatewayTransport: "pull",
					sessionStore: {
						load: () => Effect.succeed(null),
						save: (_botId, offset) =>
							Ref.update(savedOffsetsRef, (offsets) => [...offsets, offset]).pipe(Effect.asVoid),
					},
				})

				yield* Effect.gen(function* () {
					const bot = yield* HazelBotClient
					yield* bot.onCommand(EchoCommand, (ctx) =>
						Ref.update(handledArgsRef, (handled) => [...handled, ctx.args.text]).pipe(Effect.asVoid),
					)
					yield* bot.start
					yield* Effect.sleep(Duration.millis(100))

					expect(yield* Ref.get(handledArgsRef)).toEqual(["hello"])
					expect(yield* Ref.get(savedOffsetsRef)).toEqual(["1"])
					expect(queryModes).not.toContain("long-poll")
				}).pipe(Effect.scoped, Effect.provide(TestLayer))
			}),
		))

	it("does not advance the offset when command handling fails", () =>
		Effect.runPromise(
			Effect.gen(function* () {
				const attemptsRef = yield* Ref.make(0)
				const savedOffsetsRef = yield* Ref.make<Array<string>>([])

				server.use(
					http.post(`${BACKEND_URL}/bot-commands/sync`, async () =>
						HttpResponse.json({ syncedCount: 1 }),
					),
					http.patch(`${BACKEND_URL}/bot-commands/settings`, async () =>
						HttpResponse.json({ success: true }),
					),
					http.get(`${BACKEND_URL}/bot-gateway/stream`, async () =>
						HttpResponse.json([commandEnvelope], {
							headers: { "Stream-Next-Offset": "1" },
						}),
					),
				)

				const TestLayer = makeHazelBotLayer({
					commands: CommandGroup.make(EchoCommand),
					gatewayTransport: "pull",
					sessionStore: {
						load: () => Effect.succeed(null),
						save: (_botId, offset) =>
							Ref.update(savedOffsetsRef, (offsets) => [...offsets, offset]).pipe(Effect.asVoid),
					},
				})

				yield* Effect.gen(function* () {
					const bot = yield* HazelBotClient
					yield* bot.onCommand(EchoCommand, () =>
						Ref.update(attemptsRef, (attempts) => attempts + 1).pipe(
							Effect.zipRight(Effect.fail(new Error("boom"))),
						),
					)
					yield* bot.start
					yield* Effect.sleep(Duration.millis(100))

					expect(yield* Ref.get(attemptsRef)).toBe(1)
					expect(yield* Ref.get(savedOffsetsRef)).toEqual([])
				}).pipe(Effect.scoped, Effect.provide(TestLayer))
			}),
		))
})

describe("startBotEventPipeline", () => {
	it("skips shape stream and dispatcher startup when no DB handlers are registered", () =>
		Effect.runPromise(
			Effect.scoped(
				Effect.gen(function* () {
					const shapeStreamStarts = yield* Ref.make(0)
					const dispatcherStarts = yield* Ref.make(0)

					const dispatcher = {
						registeredEventTypes: Effect.succeed([] as string[]),
						start: Ref.update(dispatcherStarts, (n) => n + 1).pipe(Effect.asVoid),
					}

					const subscriber = {
						start: (_tables?: ReadonlySet<string>) =>
							Ref.update(shapeStreamStarts, (n) => n + 1).pipe(Effect.asVoid),
					}

					yield* startBotEventPipeline(dispatcher as any, subscriber as any)

					expect(yield* Ref.get(shapeStreamStarts)).toBe(0)
					expect(yield* Ref.get(dispatcherStarts)).toBe(0)
				}),
			),
		))

	it("starts shape streams and dispatcher when DB handlers exist", () =>
		Effect.runPromise(
			Effect.scoped(
				Effect.gen(function* () {
					const requiredTablesRef = yield* Ref.make<ReadonlySet<string> | undefined>(undefined)
					const dispatcherStarts = yield* Ref.make(0)

					const dispatcher = {
						registeredEventTypes: Effect.succeed([
							"messages.insert",
							"channels.update",
						] as string[]),
						start: Ref.update(dispatcherStarts, (n) => n + 1).pipe(Effect.asVoid),
					}

					const subscriber = {
						start: (tables?: ReadonlySet<string>) =>
							Ref.set(requiredTablesRef, tables).pipe(Effect.asVoid),
					}

					yield* startBotEventPipeline(dispatcher as any, subscriber as any)

					const requiredTables = yield* Ref.get(requiredTablesRef)
					expect(requiredTables).toBeDefined()
					expect(Array.from(requiredTables ?? []).sort()).toEqual(["channels", "messages"])
					expect(yield* Ref.get(dispatcherStarts)).toBe(1)
				}),
			),
		))
})
