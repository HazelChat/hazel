import { Cause, Effect, Exit, Option } from "effect"
import { describe, expect, it, vi } from "vitest"
import * as Queue from "./queue.ts"

const createContext = (queue: unknown) => ({ queue })

describe("@hazel/rivet-effect queue helpers", () => {
	it("returns Option.none when queue has no next message", async () => {
		const ctx = createContext({
			next: vi.fn(async () => undefined),
		})

		const result = await Effect.runPromise(Queue.next(ctx as any, "jobs"))
		expect(Option.isNone(result)).toBe(true)
	})

	it("fails with QueueUnavailableError when queue API is missing", async () => {
		const ctx = createContext(undefined)
		const exit = await Effect.runPromiseExit(Queue.next(ctx as any, "jobs"))

		expect(Exit.isFailure(exit)).toBe(true)
		if (Exit.isFailure(exit)) {
			const failure = Cause.failureOption(exit.cause)
			expect(Option.isSome(failure)).toBe(true)
			if (Option.isSome(failure)) {
				expect(failure.value).toMatchObject({
					_tag: "QueueUnavailableError",
					queueName: "jobs",
				})
			}
		}
	})

	it("maps queue promise rejections to QueueReceiveError", async () => {
		const ctx = createContext({
			next: vi.fn(async () => {
				throw new Error("transport failure")
			}),
		})
		const exit = await Effect.runPromiseExit(Queue.next(ctx as any, "jobs"))

		expect(Exit.isFailure(exit)).toBe(true)
		if (Exit.isFailure(exit)) {
			const failure = Cause.failureOption(exit.cause)
			expect(Option.isSome(failure)).toBe(true)
			if (Option.isSome(failure)) {
				expect(failure.value).toMatchObject({
					_tag: "QueueReceiveError",
					queueName: "jobs",
				})
			}
		}
	})

	it("normalizes nextMultiple undefined result to empty array", async () => {
		const ctx = createContext({
			next: vi.fn(async () => undefined),
		})

		const result = await Effect.runPromise(Queue.nextMultiple(ctx as any, ["jobs", "audit"]))
		expect(result).toEqual([])
	})
})
