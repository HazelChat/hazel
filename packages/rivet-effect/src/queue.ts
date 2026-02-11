import { Effect, Option } from "effect"
import type { ActorContext } from "rivetkit"
import { QueueReceiveError, QueueUnavailableError } from "./errors.ts"

interface QueueReceiveOptions {
	count?: number
	timeout?: number
}

export interface QueueMessage {
	id: bigint
	name: string
	body: unknown
	createdAt: number
}

type AnyQueue = {
	next: (
		nameOrNames: string | string[],
		opts?: QueueReceiveOptions,
	) => Promise<QueueMessage | QueueMessage[] | undefined>
}

const getQueueOrFail = (
	queue: unknown,
	queueName?: string,
): Effect.Effect<AnyQueue, QueueUnavailableError, never> => {
	if (!queue || typeof queue !== "object" || !("next" in queue) || typeof (queue as any).next !== "function") {
		return Effect.fail(
			new QueueUnavailableError({
				message: "Actor queue is unavailable in this context",
				queueName,
			}),
		)
	}

	return Effect.succeed(queue as AnyQueue)
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
): Effect.Effect<Option.Option<QueueMessage>, QueueReceiveError | QueueUnavailableError, never> =>
	Effect.gen(function* () {
		const queue = yield* getQueueOrFail((c as any).queue, name)
		const message = yield* Effect.tryPromise({
			try: () => queue.next(name, opts),
			catch: (error) =>
				new QueueReceiveError({
					message: `Failed to receive next queue message for '${name}'`,
					queueName: name,
					cause: error,
				}),
		})

		if (message === undefined) {
			return Option.none<QueueMessage>()
		}

		return Option.some(message as QueueMessage)
	})

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
): Effect.Effect<ReadonlyArray<QueueMessage>, QueueReceiveError | QueueUnavailableError, never> =>
	Effect.gen(function* () {
		const queueName = names.join(",")
		const queue = yield* getQueueOrFail((c as any).queue, queueName)
		const messages = yield* Effect.tryPromise({
			try: () => queue.next(names, opts),
			catch: (error) =>
				new QueueReceiveError({
					message: `Failed to receive queue messages for '${queueName}'`,
					queueName,
					cause: error,
				}),
		})

		if (messages === undefined) {
			return []
		}

		if (Array.isArray(messages)) {
			return messages
		}

		return [messages]
	})
