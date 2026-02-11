import { Effect } from "effect"
import type { ActorContext, ActionContext } from "rivetkit"
import type { YieldWrap } from "effect/Utils"
import { provideActorContext } from "./actor.ts"
import { runPromise } from "./runtime.ts"

export * from "./actor.ts"

export const getConn = <
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
>(
	c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
) => Effect.succeed(c.conn)

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
		c: ActorContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		...args: Args
	) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
): (
	c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	...args: Args
) => AEff {
	return ((c, ...args) => {
		const gen = genFn(c, ...args)
		const eff = Effect.gen<YieldWrap<Effect.Effect<any, any, any>>, AEff>(() => gen)
		const withContext = provideActorContext(eff, c)
		return runPromise(withContext, c)
	}) as (
		c: ActionContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
		...args: Args
	) => AEff
}
