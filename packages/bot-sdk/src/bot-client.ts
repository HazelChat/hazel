import { Effect, type ManagedRuntime, type Scope } from "effect"
import { BotAuth, type BotAuthContext } from "./auth.ts"
import { BotStartError } from "./errors.ts"
import { EventDispatcher } from "./services/event-dispatcher.ts"
import { ShapeStreamSubscriber } from "./services/shape-stream-subscriber.ts"
import type { EventHandler } from "./types/handlers.ts"
import type { EventType } from "./types/events.ts"

/**
 * Bot client for interacting with the application
 */
export class BotClient extends Effect.Service<BotClient>()("BotClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const dispatcher = yield* EventDispatcher
		const subscriber = yield* ShapeStreamSubscriber
		const auth = yield* BotAuth

		return {
			/**
			 * Register a generic event handler for a specific event type
			 * @param eventType - The event type (e.g., "messages.insert", "channels.update")
			 * @param handler - The handler function to process events of this type
			 */
			on: <A, R>(eventType: EventType, handler: EventHandler<A, R>) =>
				dispatcher.on(eventType, handler),

			/**
			 * Start the bot client
			 * This begins listening to events and dispatching to handlers
			 */
			start: Effect.gen(function* () {
				yield* Effect.log("Starting bot client...")

				// Start shape stream subscriptions
				yield* subscriber.start.pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new BotStartError({
								message: "Failed to start shape stream subscriptions",
								cause: error,
							}),
						),
					),
				)

				// Start event dispatcher
				yield* dispatcher.start.pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new BotStartError({
								message: "Failed to start event dispatcher",
								cause: error,
							}),
						),
					),
				)

				yield* Effect.log("Bot client started successfully")
			}),

			/**
			 * Get bot authentication context
			 */
			getAuthContext: auth.getContext.pipe(Effect.orDie),
		}
	}),
}) {}

/**
 * Helper type for bot application
 */
export type BotApp<R = never> = Effect.Effect<void, never, BotClient | Scope.Scope | R>

/**
 * Run a bot application
 */
export const runBot = <R>(
	app: BotApp<R>,
	runtime: ManagedRuntime.ManagedRuntime<BotClient | R, unknown>,
): void => {
	const program = Effect.scoped(app)

	runtime.runFork(program)
}
