import { Cause, Effect, Exit, Option } from "effect"
import { describe, expect, it, vi } from "vitest"
import * as Action from "./action.ts"
import * as Hook from "./actor.ts"
import { OnStateChange } from "./lifecycle.ts"

const createContext = () => {
	const waitUntil = vi.fn((promise: Promise<unknown>) => {
		void promise.catch(() => undefined)
	})

	return {
		state: { count: 0 },
		vars: {},
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		actorId: "actor-1",
		name: "message",
		key: ["key-1"],
		region: "test",
		schedule: null,
		conns: [],
		client: vi.fn(() => ({})),
		db: {},
		kv: {},
		queue: { next: vi.fn() },
		waitUntil,
		abortSignal: new AbortController().signal,
		sleep: vi.fn(),
		destroy: vi.fn(),
		saveState: vi.fn(async () => undefined),
		broadcast: vi.fn(),
		conn: { state: null },
	}
}

describe("@hazel/rivet-effect wrappers", () => {
	it("Action.effect provides actor context and resolves async result", async () => {
		const ctx = createContext()
		const add = Action.effect(function* (c: any, amount: number) {
			yield* Action.updateState(c, (s: { count: number }) => {
				s.count += amount
			})
			return yield* Action.state(c)
		})

		const state = await add(ctx as any, 3)
		expect(state).toEqual({ count: 3 })
	})

	it("Action.try maps failures into RuntimeExecutionError", async () => {
		const ctx = createContext()
		const failingAction = Action.try(function* () {
			return yield* Effect.fail("boom")
		})

		await expect(failingAction(ctx as any)).rejects.toMatchObject({
			_tag: "RuntimeExecutionError",
			operation: "Action.try",
		})
	})

	it("Hook.try maps failures into RuntimeExecutionError and logs runtime failure", async () => {
		const ctx = createContext()
		const failingHook = Hook.try(function* () {
			return yield* Effect.fail("boom")
		})

		await expect(failingHook(ctx as any)).rejects.toMatchObject({
			_tag: "RuntimeExecutionError",
			operation: "Hook.try",
		})
		expect(ctx.log.error).toHaveBeenCalledWith(
			expect.objectContaining({ msg: "actor effect failed" }),
		)
	})

	it("saveState maps promise rejection into StatePersistenceError", async () => {
		const ctx = createContext()
		ctx.saveState = vi.fn(async () => {
			throw new Error("write failure")
		})
		const exit = await Effect.runPromiseExit(Hook.saveState(ctx as any, { debounce: 0 } as any))

		expect(Exit.isFailure(exit)).toBe(true)
		if (Exit.isFailure(exit)) {
			const failure = Cause.failureOption(exit.cause)
			expect(Option.isSome(failure)).toBe(true)
			if (Option.isSome(failure)) {
				expect(failure.value).toMatchObject({ _tag: "StatePersistenceError" })
			}
		}
	})

	it("OnStateChange logs effect failures", async () => {
		const ctx = createContext()
		const onStateChange = OnStateChange.effect(function* () {
			yield* Effect.fail("state-sync-failed")
		})

		onStateChange(ctx as any, { count: 1 })
		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(ctx.log.error).toHaveBeenCalledWith(
			expect.objectContaining({ msg: "onStateChange effect failed" }),
		)
	})
})
