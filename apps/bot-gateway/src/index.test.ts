import { describe, expect, it } from "bun:test"
import { ConfigProvider, Effect, Either, Layer, Option, Redacted, Runtime } from "effect"
import {
	createGatewayServer,
	GatewayStartupError,
	InstrumentedConfigLive,
	instrumentStartupLayer,
} from "./index"

const TEST_CONFIG = {
	port: 8080,
	isDev: false,
	databaseUrl: Redacted.make("postgresql://user:password@db.internal:5432/app"),
	durableStreamsUrl: "http://durable.test/v1/stream",
	durableStreamsToken: Option.none(),
	heartbeatIntervalMs: 25_000,
	leaseTtlSeconds: 75,
	batchAckTimeoutMs: 60_000,
} as const

const makeHub = () =>
	({
		onOpen: () => Effect.void,
		onMessage: () => Effect.void,
		onClose: () => Effect.void,
		validateBotToken: () =>
			Effect.succeed({
				id: "00000000-0000-0000-0000-000000000111",
				name: "test-bot",
			}),
		proxyRead: () =>
			Effect.succeed(
				new Response("[]", {
					status: 200,
					headers: new Headers({
						"Content-Type": "application/json",
						"Stream-Next-Offset": "0",
					}),
				}),
			),
	}) as any

const makeTestRuntime = async () =>
	(await Effect.runPromise(Effect.runtime<never>())) as Runtime.Runtime<never>

describe("bot-gateway startup", () => {
	it("maps config failures to GatewayStartupError", async () => {
		const result = await Effect.runPromise(
			Effect.scoped(
				Layer.build(
					InstrumentedConfigLive.pipe(
						Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map()))),
					),
				).pipe(Effect.either),
			),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(GatewayStartupError)
			expect(result.left.dependency).toBe("config")
		}
	})

	it("maps database failures to GatewayStartupError", async () => {
		const result = await Effect.runPromise(
			Effect.scoped(
				Layer.build(
					instrumentStartupLayer(Layer.fail(new Error("db unavailable")), {
						dependency: "database",
						startMessage: "db start",
						successMessage: "db ok",
						failureMessage: "db failed",
					}),
				).pipe(Effect.either),
			),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(GatewayStartupError)
			expect(result.left.dependency).toBe("database")
			expect(result.left.message).toBe("db failed")
		}
	})

	it("maps redis failures to GatewayStartupError", async () => {
		const result = await Effect.runPromise(
			Effect.scoped(
				Layer.build(
					instrumentStartupLayer(Layer.fail(new Error("redis unavailable")), {
						dependency: "redis",
						startMessage: "redis start",
						successMessage: "redis ok",
						failureMessage: "redis failed",
					}),
				).pipe(Effect.either),
			),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(GatewayStartupError)
			expect(result.left.dependency).toBe("redis")
		}
	})

	it("maps tracer failures to GatewayStartupError", async () => {
		const result = await Effect.runPromise(
			Effect.scoped(
				Layer.build(
					instrumentStartupLayer(Layer.fail(new Error("tracer unavailable")), {
						dependency: "tracer",
						startMessage: "tracer start",
						successMessage: "tracer ok",
						failureMessage: "tracer failed",
					}),
				).pipe(Effect.either),
			),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(GatewayStartupError)
			expect(result.left.dependency).toBe("tracer")
		}
	})

	it("maps server bind failures to GatewayStartupError", async () => {
		const runtime = await makeTestRuntime()
		const result = await Effect.runPromise(
			Effect.scoped(
				createGatewayServer({
					config: TEST_CONFIG as any,
					hub: makeHub(),
					runtime,
					serve: () => {
						throw new Error("bind failed")
					},
				}).pipe(Effect.either),
			),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(GatewayStartupError)
			expect(result.left.dependency).toBe("server")
		}
	})

	it("starts the server with a fake serve function and wires handlers", async () => {
		const runtime = await makeTestRuntime()
		let stopCalls = 0
		let servedOptions: any = null

		const result = await Effect.runPromise(
			Effect.scoped(
				createGatewayServer({
					config: TEST_CONFIG as any,
					hub: makeHub(),
					runtime,
					serve: (options: any) => {
						servedOptions = options
						return {
							port: TEST_CONFIG.port,
							stop: () => {
								stopCalls += 1
							},
						}
					},
				}),
			),
		)

		expect(result.port).toBe(TEST_CONFIG.port)
		expect(stopCalls).toBe(1)
		expect(servedOptions.fetch).toBeTypeOf("function")
		expect(servedOptions.websocket.open).toBeTypeOf("function")
	})
})
