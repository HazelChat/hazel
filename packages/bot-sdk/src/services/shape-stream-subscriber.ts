import { isChangeMessage, type Message, ShapeStream } from "@electric-sql/client"
import { Effect, type Scope, Stream } from "effect"
import type { ShapeStreamError } from "../errors.ts"
import type { ElectricEvent } from "../types/events.ts"
import { ElectricEventQueue } from "./electric-event-queue.ts"

/**
 * Configuration for a shape stream subscription
 */
export interface ShapeSubscriptionConfig {
	/**
	 * Table name to subscribe to
	 */
	readonly table: string

	/**
	 * Optional WHERE clause for filtering
	 */
	readonly where?: string

	/**
	 * Optional column selection
	 */
	readonly columns?: readonly string[]

	/**
	 * Start from current position (ignore historical data)
	 * @default true
	 */
	readonly startFromNow?: boolean
}

/**
 * Configuration for the shape stream subscriber
 */
export interface ShapeStreamSubscriberConfig {
	/**
	 * Electric proxy URL
	 */
	readonly electricUrl: string

	/**
	 * Bot authentication token
	 */
	readonly botToken: string

	/**
	 * Tables to subscribe to
	 */
	readonly subscriptions: readonly ShapeSubscriptionConfig[]
}

/**
 * Service that subscribes to Electric SQL shape streams
 */
export class ShapeStreamSubscriber extends Effect.Service<ShapeStreamSubscriber>()("ShapeStreamSubscriber", {
	accessors: true,
	effect: Effect.fn(function* (config: ShapeStreamSubscriberConfig) {
		const queue = yield* ElectricEventQueue

		// Helper to create a shape stream as an Effect Stream
		const createShapeStream = (
			subscription: ShapeSubscriptionConfig,
		): Stream.Stream<Message, ShapeStreamError> =>
			Stream.asyncPush<Message, ShapeStreamError>((emit) =>
				Effect.gen(function* () {
					yield* Effect.log(`Creating shape stream for table: ${subscription.table}`)

					console.log("subscription", subscription)

					const stream = new ShapeStream({
						url: config.electricUrl,
						params: {
							table: subscription.table,
							...(subscription.where && { where: subscription.where }),
							...(subscription.columns && {
								columns: subscription.columns as string[],
							}),
						},
						offset: !subscription.startFromNow ? undefined : "now",
						fetchClient: (input: string | URL | Request, init?: RequestInit) =>
							fetch(input, {
								...init,
								headers: {
									...init?.headers,
									Authorization: `Bearer ${config.botToken}`,
								},
							}),
					})

					// Subscribe to the stream
					const unsubscribe = stream.subscribe((messages) => {
						// Emit each message individually to the Effect Stream
						for (const message of messages) {
							emit.single(message)
						}
					})

					// Register cleanup - unsubscribe when the stream is finalized
					yield* Effect.addFinalizer(() =>
						Effect.gen(function* () {
							yield* Effect.log(`Unsubscribing from table: ${subscription.table}`)
							yield* Effect.sync(() => unsubscribe())
						}),
					)

					yield* Effect.log(`Shape stream subscription active for table: ${subscription.table}`)
				}),
			)

		return {
			/**
			 * Start all shape stream subscriptions
			 * Returns an Effect that requires Scope - the streams will run until the scope is closed
			 */
			start: Effect.gen(function* () {
				yield* Effect.log(
					`Starting shape stream subscriptions for ${config.subscriptions.length} tables`,
				)

				// Start consuming each shape stream
				yield* Effect.forEach(
					config.subscriptions,
					(subscription) =>
						createShapeStream(subscription).pipe(
							// Filter out control messages (only process change messages)
							Stream.filter(isChangeMessage),
							// Process each change message
							Stream.mapEffect((message) =>
								Effect.gen(function* () {
									// Create event from message
									console.log("message", message)
									const event: ElectricEvent = {
										operation: message.headers.operation as
											| "insert"
											| "update"
											| "delete",
										table: subscription.table,
										value: message.value as any,
										timestamp: new Date(),
									}

									// Offer event to queue
									yield* queue.offer(event)
								}),
							),
							// Consume the stream
							Stream.runDrain,
							// Fork as a scoped fiber - will be interrupted when scope closes
							Effect.forkScoped,
							// Handle any errors during subscription
							Effect.catchAll((error) =>
								Effect.logError(
									`Failed to process shape stream for table: ${subscription.table}`,
									{
										error,
									},
								),
							),
						),
					{ concurrency: "unbounded" },
				)

				yield* Effect.log("All shape stream subscriptions started successfully")
			}),
		}
	}),
}) {}
