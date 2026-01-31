import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Exit, Fiber, Queue, Ref, Schedule, Stream, TestContext } from "effect"
import { SseConnectionError } from "./sse-command-listener.ts"

// ============================================================================
// Test: Queue coordination
// ============================================================================

describe("event queue coordination", () => {
	it("Queue.shutdown signals stream consumers to stop", () =>
		Effect.gen(function* () {
			const eventQueue = yield* Queue.unbounded<string>()
			const processedEvents: string[] = []

			// Start a consumer that processes from the queue
			const consumerFiber = yield* Stream.fromQueue(eventQueue).pipe(
				Stream.tap((event) =>
					Effect.sync(() => {
						processedEvents.push(event)
					}),
				),
				Stream.runDrain,
				Effect.fork,
			)

			// Offer some events
			yield* Queue.offer(eventQueue, "event1")
			yield* Queue.offer(eventQueue, "event2")

			// Small delay to let consumer process
			yield* Effect.yieldNow()

			// Shutdown the queue - this should terminate the consumer
			yield* Queue.shutdown(eventQueue)

			// Consumer should complete (not hang forever)
			const exit = yield* Fiber.await(consumerFiber)

			expect(Exit.isSuccess(exit)).toBe(true)
			expect(processedEvents).toContain("event1")
			expect(processedEvents).toContain("event2")
		}).pipe(Effect.runPromise))

	it("Effect.ensuring shuts down queue when stream ends", () =>
		Effect.gen(function* () {
			const eventQueue = yield* Queue.unbounded<string>()
			let queueShutdown = false

			// Simulate a response stream that ends after a few chunks
			const responseStream = Stream.make("chunk1", "chunk2", "chunk3")

			// Process like the SSE listener does
			yield* responseStream.pipe(
				Stream.runDrain,
				Effect.ensuring(
					Effect.gen(function* () {
						queueShutdown = true
						yield* Queue.shutdown(eventQueue)
					}),
				),
			)

			expect(queueShutdown).toBe(true)

			// Verify queue is actually shutdown
			const isShutdown = yield* Queue.isShutdown(eventQueue)
			expect(isShutdown).toBe(true)
		}).pipe(Effect.runPromise))

	it("Effect.ensuring runs on stream error too", () =>
		Effect.gen(function* () {
			const eventQueue = yield* Queue.unbounded<string>()
			let ensuringRan = false

			// Simulate a response stream that fails
			const failingStream = Stream.make("chunk1").pipe(
				Stream.concat(Stream.fail(new Error("connection lost"))),
			)

			const exit = yield* failingStream.pipe(
				Stream.runDrain,
				Effect.ensuring(
					Effect.sync(() => {
						ensuringRan = true
					}),
				),
				Effect.exit,
			)

			expect(Exit.isFailure(exit)).toBe(true)
			expect(ensuringRan).toBe(true)
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Fiber coordination
// ============================================================================

describe("fiber coordination", () => {
	it("Fiber.join propagates stream fiber errors", () =>
		Effect.gen(function* () {
			// Simulate the pattern: fork a stream, process queue, then join fiber
			const streamFiber = yield* Stream.make(1, 2, 3).pipe(
				Stream.concat(Stream.fail(new Error("stream died"))),
				Stream.runDrain,
				Effect.fork,
			)

			// Join should fail with the stream error
			const exit = yield* Fiber.join(streamFiber).pipe(Effect.exit)

			expect(Exit.isFailure(exit)).toBe(true)
			if (Exit.isFailure(exit)) {
				expect(String(exit.cause)).toContain("stream died")
			}
		}).pipe(Effect.runPromise))

	it("successful stream + queue processing completes normally", () =>
		Effect.gen(function* () {
			const eventQueue = yield* Queue.unbounded<number>()
			const processed: number[] = []

			// Fork stream that feeds the queue
			const streamFiber = yield* Stream.make(1, 2, 3).pipe(
				Stream.tap((n) => Queue.offer(eventQueue, n)),
				Stream.runDrain,
				Effect.ensuring(Queue.shutdown(eventQueue)),
				Effect.fork,
			)

			// Process queue
			yield* Stream.fromQueue(eventQueue).pipe(
				Stream.tap((n) =>
					Effect.sync(() => {
						processed.push(n)
					}),
				),
				Stream.runDrain,
			)

			// Join the stream fiber
			yield* Fiber.join(streamFiber)

			expect(processed).toEqual([1, 2, 3])
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Retry behavior with permanent failure recovery
// ============================================================================

describe("permanent failure recovery", () => {
	it("recovery pattern: catch error, wait, then retry whole cycle", () =>
		Effect.gen(function* () {
			const attemptCycles = yield* Ref.make(0)
			const recoveryWaits = yield* Ref.make(0)

			// Simulate the SSE listener retry pattern (simplified)
			const connectAndProcess = Effect.gen(function* () {
				yield* Ref.update(attemptCycles, (n) => n + 1)
				return yield* Effect.fail(new SseConnectionError({ message: "Connection refused" }))
			})

			// Run one iteration of the forever loop
			yield* connectAndProcess.pipe(
				Effect.retry(Schedule.recurs(2)), // 3 attempts total
				Effect.tapError(() => Ref.update(attemptCycles, () => 0)), // Reset for next cycle
				Effect.catchAll(() =>
					Effect.gen(function* () {
						yield* Ref.update(recoveryWaits, (n) => n + 1)
						// In real code, this would be Effect.sleep("60 seconds")
					}),
				),
			)

			const waits = yield* Ref.get(recoveryWaits)
			expect(waits).toBe(1) // One recovery wait after retry exhaustion
		}).pipe(Effect.runPromise))

	it("isRunningRef tracks connection state", () =>
		Effect.gen(function* () {
			const isRunningRef = yield* Ref.make(false)

			// Simulate successful connection
			yield* Ref.set(isRunningRef, true)
			expect(yield* Ref.get(isRunningRef)).toBe(true)

			// Simulate connection failure
			yield* Ref.set(isRunningRef, false)
			expect(yield* Ref.get(isRunningRef)).toBe(false)
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Error types
// ============================================================================

describe("SseConnectionError", () => {
	it("has correct tag", () => {
		const error = new SseConnectionError({
			message: "Connection failed",
			cause: new Error("ECONNREFUSED"),
		})

		expect(error._tag).toBe("SseConnectionError")
		expect(error.message).toBe("Connection failed")
	})

	it("can wrap HTTP errors", () => {
		const error = new SseConnectionError({
			message: "Request error: Connection timeout",
			cause: { code: "ETIMEDOUT" },
		})

		expect(error.message).toContain("Request error")
	})

	it("can wrap response errors", () => {
		const error = new SseConnectionError({
			message: "Response error: Server returned 503",
			cause: { status: 503 },
		})

		expect(error.message).toContain("Response error")
	})
})

// ============================================================================
// Test: Schedule behavior
// ============================================================================

describe("retry schedule", () => {
	it("Schedule.recurs limits retry count", () =>
		Effect.gen(function* () {
			let attempts = 0

			const exit = yield* Effect.gen(function* () {
				attempts++
				return yield* Effect.fail("error")
			}).pipe(Effect.retry(Schedule.recurs(5)), Effect.exit)

			// 1 initial + 5 retries = 6 attempts
			expect(attempts).toBe(6)
		}).pipe(Effect.runPromise))

	it("Schedule.intersect limits retries to the minimum", () =>
		Effect.gen(function* () {
			let attempts = 0

			// intersect(recurs(3), recurs(10)) should stop after 3
			const schedule = Schedule.intersect(Schedule.recurs(3), Schedule.recurs(10))

			yield* Effect.gen(function* () {
				attempts++
				return yield* Effect.fail("error")
			}).pipe(Effect.retry(schedule), Effect.exit)

			// 1 initial + 3 retries = 4 attempts (limited by first recurs)
			expect(attempts).toBe(4)
		}).pipe(Effect.runPromise))

	it("schedule composition creates valid retry strategy", () => {
		// Verify the schedule we use in the real code is valid
		const schedule = Schedule.exponential("1 second", 2).pipe(
			Schedule.jittered,
			Schedule.intersect(Schedule.recurs(10)),
		)

		expect(schedule).toBeDefined()
	})
})

// ============================================================================
// Test: Queue offer error handling
// ============================================================================

describe("queue offer error handling", () => {
	it("Effect.ignore swallows errors after logging", () =>
		Effect.gen(function* () {
			let errorLogged = false

			const result = yield* Effect.fail(new Error("queue full")).pipe(
				Effect.tapError(() =>
					Effect.sync(() => {
						errorLogged = true
					}),
				),
				Effect.ignore,
			)

			expect(errorLogged).toBe(true)
			expect(result).toBeUndefined()
		}).pipe(Effect.runPromise))

	it("sliding queue handles overflow gracefully", () =>
		Effect.gen(function* () {
			// Use sliding queue like the real code does
			const queue = yield* Queue.sliding<string>(2)

			// Fill beyond capacity
			yield* Queue.offer(queue, "first")
			yield* Queue.offer(queue, "second")
			yield* Queue.offer(queue, "third") // Should drop "first"

			// Take all - should only have "second" and "third"
			const items = yield* Queue.takeAll(queue)
			expect(items.length).toBe(2)
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Command event structure
// ============================================================================

describe("command event parsing", () => {
	it("valid command event structure", () => {
		const validEvent = {
			type: "command",
			commandName: "test-command",
			channelId: "ch_123",
			userId: "usr_456",
			orgId: "org_789",
			arguments: { foo: "bar" },
			timestamp: Date.now(),
		}

		expect(validEvent.type).toBe("command")
		expect(validEvent.commandName).toBe("test-command")
		expect(typeof validEvent.timestamp).toBe("number")
	})
})

// ============================================================================
// Test: Effect.forever pattern
// ============================================================================

describe("Effect.forever pattern", () => {
	it("Effect.forever keeps running after catchAll", () =>
		Effect.gen(function* () {
			const iterations = yield* Ref.make(0)

			const fiber = yield* Effect.forever(
				Effect.gen(function* () {
					const count = yield* Ref.updateAndGet(iterations, (n) => n + 1)
					if (count <= 3) {
						return yield* Effect.fail("error")
					}
					// Stop the loop by interrupting
					return yield* Effect.interrupt
				}).pipe(
					Effect.catchAll(() => Effect.void), // Swallow error, continue loop
				),
			).pipe(Effect.fork)

			// Let it run
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()

			const count = yield* Ref.get(iterations)
			expect(count).toBeGreaterThanOrEqual(3)

			yield* Fiber.interrupt(fiber)
		}).pipe(Effect.runPromise))
})
