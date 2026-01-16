import { it, describe, expect } from "@effect/vitest"
import { Duration, Effect, Fiber, Ref, Schedule, TestClock } from "effect"
import { createScheduledStream } from "./tauri-update-atoms"

describe("createScheduledStream", () => {
	it.effect("Schedule.spaced waits for the interval before first emission", () =>
		Effect.gen(function* () {
			const timestamps = yield* Ref.make<number[]>([])
			const effect = Effect.gen(function* () {
				const now = yield* TestClock.currentTimeMillis
				yield* Ref.update(timestamps, (ts) => [...ts, now])
			})
			const schedule = Schedule.spaced(Duration.millis(100))

			const fiber = yield* createScheduledStream(schedule, effect).pipe(Effect.fork)

			// Let the stream run for a bit
			yield* TestClock.adjust(Duration.millis(250))

			// Schedule.spaced waits for the interval before first emission
			// First emission at t=100, then t=200
			const result = yield* Ref.get(timestamps)
			expect(result).toEqual([100, 200])

			yield* Fiber.interrupt(fiber)
		}),
	)

	it.effect("Schedule.union(once, spaced) emits immediately at t=0 then continues with interval", () =>
		Effect.gen(function* () {
			const timestamps = yield* Ref.make<number[]>([])
			const effect = Effect.gen(function* () {
				const now = yield* TestClock.currentTimeMillis
				yield* Ref.update(timestamps, (ts) => [...ts, now])
			})
			// This schedule emits once at t=0 (from once), then at intervals (from spaced)
			const correctSchedule = Schedule.union(Schedule.once, Schedule.spaced(Duration.millis(100)))

			const fiber = yield* createScheduledStream(correctSchedule, effect).pipe(Effect.fork)

			// Let the stream run for a bit
			yield* TestClock.adjust(Duration.millis(250))

			const result = yield* Ref.get(timestamps)
			// Emits at t=0 (once), then t=100, t=200 (spaced) - NO double emission
			expect(result).toEqual([0, 100, 200])

			yield* Fiber.interrupt(fiber)
		}),
	)

	it.effect("for immediate-then-periodic behavior, use union(once, spaced) not just spaced", () =>
		Effect.gen(function* () {
			const spacedTimestamps = yield* Ref.make<number[]>([])
			const unionTimestamps = yield* Ref.make<number[]>([])

			const recordTimestamp = (ref: Ref.Ref<number[]>) =>
				Effect.gen(function* () {
					const now = yield* TestClock.currentTimeMillis
					yield* Ref.update(ref, (ts) => [...ts, now])
				})

			const spacedSchedule = Schedule.spaced(Duration.millis(100))
			const unionSchedule = Schedule.union(Schedule.once, Schedule.spaced(Duration.millis(100)))

			const spacedFiber = yield* createScheduledStream(
				spacedSchedule,
				recordTimestamp(spacedTimestamps),
			).pipe(Effect.fork)
			const unionFiber = yield* createScheduledStream(
				unionSchedule,
				recordTimestamp(unionTimestamps),
			).pipe(Effect.fork)

			yield* TestClock.adjust(Duration.millis(250))

			const spacedResult = yield* Ref.get(spacedTimestamps)
			const unionResult = yield* Ref.get(unionTimestamps)

			// spaced alone: first emission at t=100 (delayed!)
			expect(spacedResult).toEqual([100, 200])

			// union(once, spaced): first emission at t=0 (immediate!)
			expect(unionResult).toEqual([0, 100, 200])

			yield* Fiber.interrupt(spacedFiber)
			yield* Fiber.interrupt(unionFiber)
		}),
	)
})
