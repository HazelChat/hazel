import { Effect } from "effect"
import type { ActorContext, ActionContext } from "rivetkit"
import type { YieldWrap } from "effect/Utils"
import { makeRuntimeExecutionError } from "./errors.ts"
import { provideActorContext } from "./actor.ts"
import { runPromise } from "./runtime.ts"

export {
	state,
	updateState,
	vars,
	updateVars,
	broadcast,
	getLog,
	getActorId,
	getName,
	getKey,
	getRegion,
	getSchedule,
	getConns,
	getClient,
	getDb,
	getKv,
	getQueue,
	saveState,
	waitUntil,
	getAbortSignal,
	sleep,
	destroy,
	context,
	RivetActorContext,
} from "./actor.ts"

export const getConn = <TState, TConnParams, TConnState, TVars, TInput>(
	c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
) => Effect.succeed(c.conn)

/** Wraps a generator function as a Rivet action handler with Effect support. Errors propagate normally. */
export function effect<
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
	AEff = void,
	Args extends unknown[] = [],
>(
	genFn: (
		c: ActorContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
		...args: Args
	) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
): (c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>, ...args: Args) => AEff {
	return ((c, ...args) => {
		const gen = genFn(c, ...args)
		const eff = Effect.gen<YieldWrap<Effect.Effect<any, any, any>>, AEff>(() => gen)
		const withContext = provideActorContext(eff, c)
		return runPromise(withContext, c)
	}) as (c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>, ...args: Args) => AEff
}

/**
 * Like {@link effect}, but catches all failures and wraps them in a `RuntimeExecutionError`.
 *
 * **Warning:** This erases typed error information. Prefer {@link effect} for handlers where
 * you want to handle specific error types. Use `tryEffect` only as an escape hatch for
 * top-level actions where all errors should be treated uniformly.
 */
export function tryEffect<
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
	AEff = void,
	Args extends unknown[] = [],
>(
	genFn: (
		c: ActorContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
		...args: Args
	) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
): (c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>, ...args: Args) => AEff {
	return ((c, ...args) => {
		const gen = genFn(c, ...args)
		const eff = Effect.gen<YieldWrap<Effect.Effect<any, any, any>>, AEff>(() => gen).pipe(
			Effect.catchAllCause((cause) => Effect.fail(makeRuntimeExecutionError("Action.try", cause))),
		)
		const withContext = provideActorContext(eff, c)
		return runPromise(withContext, c)
	}) as (c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>, ...args: Args) => AEff
}

export { tryEffect as try }
