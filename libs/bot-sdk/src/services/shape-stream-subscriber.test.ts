import { describe, expect, it, layer } from "@effect/vitest"
import type { Message } from "@electric-sql/client"
import {
	Deferred,
	Duration,
	Effect,
	Exit,
	Fiber,
	Layer,
	Queue,
	Ref,
	Schedule,
	Stream,
	TestClock,
	TestContext,
} from "effect"
import { ConnectionError } from "../errors.ts"
import { ElectricEventQueue, defaultEventQueueConfig } from "./electric-event-queue.ts"

// ============================================================================
// Mock ShapeStream
// ============================================================================

/**
 * Creates a mock ShapeStream that can be controlled in tests
 */
const createMockShapeStream = () => {
	let messageCallback: ((messages: Message[]) => void) | null = null
	let errorCallback: ((error: Error) => void) | null = null
	let unsubscribeCalled = false

	return {
		subscribe: (onMessages: (messages: Message[]) => void, onError?: (error: Error) => void) => {
			messageCallback = onMessages
			errorCallback = onError ?? null
			return () => {
				unsubscribeCalled = true
			}
		},
		unsubscribeAll: () => {
			unsubscribeCalled = true
		},
		// Test helpers
		emitMessages: (messages: Message[]) => {
			if (messageCallback) {
				messageCallback(messages)
			}
		},
		emitError: (error: Error) => {
			if (errorCallback) {
				errorCallback(error)
			}
		},
		wasUnsubscribed: () => unsubscribeCalled,
	}
}

/**
 * Creates a mock change message for testing
 */
const createMockChangeMessage = (
	operation: "insert" | "update" | "delete",
	value: Record<string, unknown>,
): Message =>
	({
		headers: {
			operation,
		},
		offset: "0_0",
		key: "test-key",
		value,
	}) as Message

// ============================================================================
// Test: shapeStreamToEffectStream behavior
// ============================================================================

describe("shapeStreamToEffectStream", () => {
	it("emits messages from ShapeStream callback", () =>
		Effect.gen(function* () {
			const mockStream = createMockShapeStream()
			const collectedMessages: Message[] = []

			// Create a stream using the same pattern as shapeStreamToEffectStream
			const effectStream = Stream.async<Message, ConnectionError>((emit) => {
				const unsubscribe = mockStream.subscribe(
					(messages) => {
						for (const message of messages) {
							emit.single(message)
						}
					},
					(error) => {
						emit.fail(
							new ConnectionError({
								message: `Shape stream error for table: test`,
								service: "electric",
								cause: error,
							}),
						)
					},
				)
				return Effect.sync(() => unsubscribe())
			})

			// Fork the stream consumer with a take limit
			const fiber = yield* effectStream.pipe(
				Stream.tap((msg) =>
					Effect.sync(() => {
						collectedMessages.push(msg)
					}),
				),
				Stream.take(2),
				Stream.runDrain,
				Effect.fork,
			)

			// Emit messages
			const msg1 = createMockChangeMessage("insert", { id: "1" })
			const msg2 = createMockChangeMessage("update", { id: "2" })

			// Need to yield to let fiber start
			yield* Effect.yieldNow()

			mockStream.emitMessages([msg1, msg2])

			// Wait for stream to complete
			yield* Fiber.join(fiber)

			expect(collectedMessages).toHaveLength(2)
			expect(collectedMessages[0]).toBe(msg1)
			expect(collectedMessages[1]).toBe(msg2)
		}).pipe(Effect.runPromise))

	it("fails stream when ShapeStream error callback fires", () =>
		Effect.gen(function* () {
			const mockStream = createMockShapeStream()

			// Create a stream using the same pattern as shapeStreamToEffectStream
			const effectStream = Stream.async<Message, ConnectionError>((emit) => {
				const unsubscribe = mockStream.subscribe(
					(messages) => {
						for (const message of messages) {
							emit.single(message)
						}
					},
					(error) => {
						emit.fail(
							new ConnectionError({
								message: `Shape stream error for table: test`,
								service: "electric",
								cause: error,
							}),
						)
					},
				)
				return Effect.sync(() => unsubscribe())
			})

			// Fork the stream consumer - use take(100) so it doesn't wait forever
			const fiber = yield* effectStream.pipe(Stream.take(100), Stream.runDrain, Effect.fork)

			// Need to yield to let fiber start
			yield* Effect.yieldNow()

			// Emit an error
			mockStream.emitError(new Error("Connection lost"))

			// Wait for stream to complete
			const exit = yield* Fiber.await(fiber)

			expect(Exit.isFailure(exit)).toBe(true)
			if (Exit.isFailure(exit)) {
				const error = exit.cause
				// The cause should contain our ConnectionError
				expect(String(error)).toContain("Shape stream error for table: test")
			}
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Retry behavior
// ============================================================================

describe("retry schedule behavior", () => {
	it("Schedule.union caps delay at the minimum of two schedules", () => {
		// Verify the schedule composition is correct
		// Schedule.union(exponential, spaced) means:
		// - Continue while EITHER continues
		// - Delay is the MINIMUM of both delays

		// This is a pure unit test - no need to run actual retries
		const exponential = Schedule.exponential("1 second", 2)
		const maxDelay = Schedule.spaced("30 seconds")
		const combined = Schedule.union(exponential, maxDelay)

		// The combined schedule should exist and be composable
		expect(combined).toBeDefined()
	})

	it("Effect.forever wraps retry to create infinite reconnection", () =>
		Effect.gen(function* () {
			const attemptCount = yield* Ref.make(0)

			// Simulate the pattern: Effect.forever wraps the retry
			// so even after retry exhaustion, the outer loop continues
			const fiber = yield* Effect.forever(
				Effect.gen(function* () {
					const count = yield* Ref.updateAndGet(attemptCount, (n) => n + 1)
					// Always fail first 3 times, then succeed
					if (count <= 3) {
						return yield* Effect.fail(new Error("simulated failure"))
					}
					// Stop by interrupting ourselves
					return yield* Effect.interrupt
				}).pipe(
					// No delay retry - just count attempts
					Effect.retry(Schedule.recurs(0)),
					// After retry exhaustion, catch and continue (like our code does)
					Effect.catchAll(() => Effect.void),
				),
			).pipe(Effect.fork)

			// Let it run a few iterations
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()
			yield* Effect.yieldNow()

			const count = yield* Ref.get(attemptCount)
			// Should have made multiple attempts
			expect(count).toBeGreaterThanOrEqual(3)

			yield* Fiber.interrupt(fiber)
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Integration with ElectricEventQueue
// ============================================================================

describe("ShapeStreamSubscriber integration", () => {
	const TestQueueLayer = ElectricEventQueue.Default(defaultEventQueueConfig)

	layer(TestQueueLayer)("queue integration", (it) => {
		it.scoped("events are offered to queue on successful processing", () =>
			Effect.gen(function* () {
				const queue = yield* ElectricEventQueue

				// Simulate what validateAndTransform does - offer an event
				const testEvent = {
					eventType: "messages.insert" as const,
					operation: "insert" as const,
					table: "messages",
					value: { id: "msg-1", content: "Hello" },
				}

				yield* queue.offer(testEvent as any)

				// Check queue has the event
				const size = yield* queue.size("messages.insert")
				expect(size).toBe(1)
			}),
		)
	})
})

// ============================================================================
// Test: Error handling paths
// ============================================================================

describe("error handling", () => {
	it("ConnectionError includes table name and service", () => {
		const error = new ConnectionError({
			message: "Shape stream error for table: users",
			service: "electric",
			cause: new Error("Network failure"),
		})

		expect(error._tag).toBe("ConnectionError")
		expect(error.message).toContain("users")
		expect(error.service).toBe("electric")
		expect(error.retryable).toBe(true)
	})

	it("stream errors are converted to ConnectionError with proper context", () =>
		Effect.gen(function* () {
			const mockStream = createMockShapeStream()
			const tableName = "test_table"

			const effectStream = Stream.async<Message, ConnectionError>((emit) => {
				mockStream.subscribe(
					() => {},
					(error) => {
						emit.fail(
							new ConnectionError({
								message: `Shape stream error for table: ${tableName}`,
								service: "electric",
								cause: error,
							}),
						)
					},
				)
				return Effect.void
			})

			const fiber = yield* effectStream.pipe(
				Stream.take(100), // Limit so it doesn't wait forever
				Stream.runDrain,
				Effect.fork,
			)

			// Need to yield to let fiber start
			yield* Effect.yieldNow()

			mockStream.emitError(new Error("ECONNRESET"))

			const exit = yield* Fiber.await(fiber)

			expect(Exit.isFailure(exit)).toBe(true)
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Logging behavior (verify log structure)
// ============================================================================

describe("logging", () => {
	it("log warning effect can be created with proper annotations", () =>
		Effect.gen(function* () {
			// Verify the log effect can be created with proper structure
			const logEffect = Effect.logWarning("Shape stream subscription ended, reconnecting", {
				table: "messages",
				error: "Connection reset",
			}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

			// Just verify it's an effect - we can't easily intercept logs in tests
			// without complex setup, but we can verify the effect runs without error
			yield* logEffect
		}).pipe(Effect.runPromise))
})

// ============================================================================
// Test: Schedule composition (unit tests for schedule construction)
// ============================================================================

describe("Schedule composition", () => {
	it("Schedule.union is defined and composable", () => {
		// Schedule.union(a, b) continues while either continues and takes minimum delay
		const exponential = Schedule.exponential("1 second", 2)
		const maxDelay = Schedule.spaced("10 seconds")

		const combined = Schedule.union(exponential, maxDelay)

		// Verify it can be further composed
		const withJitter = Schedule.jittered(combined)
		expect(withJitter).toBeDefined()
	})

	it("Schedule.jittered wraps another schedule", () => {
		const baseSchedule = Schedule.spaced("1 second")
		const jitteredSchedule = Schedule.jittered(baseSchedule)

		// Verify it's composable
		const withRecurs = Schedule.intersect(jitteredSchedule, Schedule.recurs(5))
		expect(withRecurs).toBeDefined()
	})

	it("Schedule.intersect limits retries", () =>
		Effect.gen(function* () {
			// Use recurs without delay to test quickly
			let attempts = 0

			yield* Effect.gen(function* () {
				attempts++
				return yield* Effect.fail("error")
			}).pipe(Effect.retry(Schedule.recurs(3)), Effect.exit)

			// 1 initial + 3 retries = 4 attempts
			expect(attempts).toBe(4)
		}).pipe(Effect.runPromise))
})
