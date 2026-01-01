/**
 * Simple Effect utilities for Rivet actors
 * Simplified version that works with Rivet's actor types
 */

import { Effect } from "effect"
import type { YieldWrap } from "effect/Utils"

/**
 * Get state from actor context as an Effect
 */
export const state = <TState>(c: { state: TState }): Effect.Effect<TState, never, never> => Effect.succeed(c.state)

/**
 * Update state in actor context
 */
export const updateState = <TState>(
	c: { state: TState },
	f: (state: TState) => void,
): Effect.Effect<void, never, never> => Effect.sync(() => f(c.state))

/**
 * Wrap an action in an Effect generator
 * This creates a Promise-returning function that runs the Effect
 */
export function effect<TContext, TArgs, TResult>(
	genFn: (c: TContext, args: TArgs) => Generator<YieldWrap<Effect.Effect<any, any, never>>, TResult, never>,
): (c: TContext, args: TArgs) => Promise<TResult> {
	return (c, args) => {
		const gen = genFn(c, args)
		const eff = Effect.gen(() => gen) as Effect.Effect<TResult, never, never>
		return Effect.runPromise(eff)
	}
}

/**
 * Alias for effect() - semantically marks the intent as a workflow
 */
export const workflow = effect
