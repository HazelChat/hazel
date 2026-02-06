import { describe, expect, it } from "@effect/vitest"
import { Effect, Fiber, Stream } from "effect"
import { createCommandSseStream, createSseHeartbeatStream } from "./bot-commands.http.ts"

describe("bot command SSE streams", () => {
	it("emits an immediate heartbeat on connect", () =>
		Effect.gen(function* () {
			const eventsChunk = yield* createSseHeartbeatStream("25 seconds").pipe(
				Stream.take(1),
				Stream.runCollect,
			)
			const events = Array.from(eventsChunk)

			expect(events).toHaveLength(1)
			expect(events[0]).toContain("event: heartbeat")
		}).pipe(Effect.runPromise))

	it("continues sending heartbeats during idle periods", () =>
		Effect.gen(function* () {
			const fiber = yield* createSseHeartbeatStream("5 millis").pipe(
				Stream.take(3),
				Stream.runCollect,
				Effect.fork,
			)

			const events = yield* Fiber.join(fiber)

			expect(events).toHaveLength(3)
			for (const event of events) {
				expect(event).toContain("event: heartbeat")
			}
		}).pipe(Effect.runPromise))

	it("passes command events through unchanged", () =>
		Effect.gen(function* () {
			const payload = JSON.stringify({
				type: "command",
				commandName: "issue",
				channelId: "ch_123",
				userId: "usr_456",
				orgId: "org_789",
				arguments: { title: "Bug" },
				timestamp: Date.now(),
			})

			const redisMock = {
				subscribe: (channel: string, handler: (message: string, chan: string) => void) =>
					Effect.sync(() => {
						queueMicrotask(() => {
							handler(payload, channel)
						})
						return { unsubscribe: Effect.void }
					}),
			}

			const stream = createCommandSseStream({
				botId: "bot_test",
				botName: "Test Bot",
				channel: "bot:bot_test:commands",
				redis: redisMock as any,
				heartbeatInterval: "1 hour",
			})

			const collector = yield* stream.pipe(Stream.take(2), Stream.runCollect, Effect.fork)

			const events = yield* Fiber.join(collector)
			const commandEvent = Array.from(events).find((event) => event.includes("event: command"))

			expect(commandEvent).toBeDefined()
			expect(commandEvent).toContain(`data: ${payload}`)
		}).pipe(Effect.runPromise))
})
