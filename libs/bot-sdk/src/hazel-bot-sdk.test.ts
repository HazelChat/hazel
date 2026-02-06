import { describe, expect, it, beforeAll, afterAll, afterEach } from "@effect/vitest"
import { Effect, Layer, Ref, Scope } from "effect"
import { BotStartError } from "./errors.ts"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import {
	HAZEL_SUBSCRIPTIONS,
	HazelBotClient,
	HazelBotRuntimeConfigTag,
	startBotEventPipeline,
} from "./hazel-bot-sdk.ts"
import { EmptyCommandGroup } from "./command.ts"
import { createBotClientTag } from "./bot-client.ts"
import { BotRpcClient, BotRpcClientConfigTag } from "./rpc/client.ts"

const BACKEND_URL = "http://localhost:3070"

const server = setupServer(
	http.patch(`${BACKEND_URL}/bot-commands/settings`, async () => HttpResponse.json({ success: true })),
)

describe("HazelBotClient mention handling", () => {
	beforeAll(() => {
		server.listen({ onUnhandledRequest: "error" })
	})

	afterEach(() => {
		server.resetHandlers()
	})

	afterAll(() => {
		server.close()
	})

	it("registers mention handler before bot.start", () =>
		Effect.runPromise(
			Effect.gen(function* () {
				const registered = yield* Ref.make<string[]>([])
				const BotClientTag = createBotClientTag<typeof HAZEL_SUBSCRIPTIONS>()

				const botClientStub = {
					on: (eventType: string, _handler: unknown) =>
						Ref.update(registered, (events) => [...events, eventType]).pipe(Effect.asVoid),
					start: Effect.gen(function* () {
						const events = yield* Ref.get(registered)
						if (!events.includes("messages.insert")) {
							return yield* Effect.fail(
								new BotStartError({
									message: "messages.insert not registered before bot.start",
									cause: undefined,
								}),
							)
						}
					}).pipe(Effect.asVoid) as Effect.Effect<void, BotStartError, Scope.Scope>,
					getAuthContext: Effect.succeed({
						botId: "bot-1",
						botName: "Test Bot",
						userId: "user-1",
						channelIds: [] as readonly string[],
						token: "test-bot-token",
					}),
				}

				const TestLayer = HazelBotClient.Default.pipe(
					Layer.provide(Layer.succeed(BotClientTag, botClientStub)),
					Layer.provide(Layer.succeed(BotRpcClient, {} as any)),
					Layer.provide(
						Layer.succeed(BotRpcClientConfigTag, {
							backendUrl: BACKEND_URL,
							botToken: "test-bot-token",
						}),
					),
					Layer.provide(
						Layer.succeed(HazelBotRuntimeConfigTag, {
							backendUrl: BACKEND_URL,
							botToken: "test-bot-token",
							commands: EmptyCommandGroup,
							mentionable: true,
						}),
					),
				)

				const program = Effect.gen(function* () {
					const bot = yield* HazelBotClient
					yield* bot.onMention(() => Effect.void)
					yield* bot.start
				})

				yield* program.pipe(Effect.scoped, Effect.provide(TestLayer))
			}) as Effect.Effect<void, unknown, never>,
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
