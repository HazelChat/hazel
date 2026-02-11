import { Effect } from "effect"
import type { ActorContext } from "rivetkit"

interface QueueReceiveOptions {
	count?: number
	timeout?: number
}

interface QueueMessage {
	id: bigint
	name: string
	body: unknown
	createdAt: number
}

export const next = <
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
>(
	c: ActorContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	name: string,
	opts?: QueueReceiveOptions,
): Effect.Effect<QueueMessage | undefined, never, never> =>
	Effect.promise(() => (c as any).queue.next(name, opts))

export const nextMultiple = <
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
>(
	c: ActorContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	names: string[],
	opts?: QueueReceiveOptions,
): Effect.Effect<QueueMessage[] | undefined, never, never> =>
	Effect.promise(() => (c as any).queue.next(names, opts))
