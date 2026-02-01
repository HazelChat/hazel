/**
 * ActorsClient Service
 *
 * Provides an Effect-based wrapper around the RivetKit actors client
 * for interacting with message actors with bot authentication.
 *
 * Uses Effect.Service pattern for proper dependency injection and testability.
 */

import { createActorsClient, type ActorsClient as RivetActorsClient } from "@hazel/actors/client"
import { Effect } from "effect"

/**
 * Type for the message actor instance
 */
export type MessageActor = ReturnType<RivetActorsClient["message"]["getOrCreate"]>

/**
 * ActorsClient service interface
 */
export interface ActorsClientService {
	/**
	 * Get or create a message actor for the given message ID.
	 * Automatically authenticates with the bot token.
	 * @param messageId - The message ID to get the actor for
	 * @returns Effect that yields the message actor
	 */
	readonly getMessageActor: (messageId: string) => Effect.Effect<MessageActor>

	/**
	 * The underlying RivetKit client (for advanced use cases)
	 */
	readonly client: RivetActorsClient

	/**
	 * The bot token used for authentication
	 */
	readonly botToken: string
}

/**
 * Configuration for ActorsClient
 */
export interface ActorsClientConfig {
	/** The actors endpoint URL (defaults to http://localhost:6420) */
	readonly endpoint?: string
	/** The bot token for authentication (hzl_bot_xxxxx) */
	readonly botToken: string
}

/**
 * ActorsClient Effect.Service for managing actor connections.
 * Wraps the RivetKit client with Effect patterns and bot authentication.
 *
 * Uses Effect.Service pattern with:
 * - Effect.fn for automatic tracing
 * - Config parameter for programmatic configuration
 * - Proper accessors for convenient usage
 *
 * @example
 * ```typescript
 * // Create layer with config
 * const layer = ActorsClient.Default({
 *   botToken: "hzl_bot_xxx",
 *   endpoint: "http://localhost:6420"
 * })
 *
 * // Use in effect
 * const program = Effect.gen(function* () {
 *   const actor = yield* ActorsClient.getMessageActor("msg-123")
 *   // ... use actor
 * }).pipe(Effect.provide(layer))
 * ```
 */
export class ActorsClient extends Effect.Service<ActorsClient>()("@hazel/bot-sdk/ActorsClient", {
	accessors: true,
	effect: Effect.fn("ActorsClient.create")(function* (config: ActorsClientConfig) {
		const endpoint = config.endpoint ?? "http://localhost:6420"
		const client = createActorsClient(endpoint)

		yield* Effect.annotateCurrentSpan("endpoint", endpoint)

		// Use Effect.fn for automatic tracing of actor operations
		const getMessageActor = Effect.fn("ActorsClient.getMessageActor")(function* (messageId: string) {
			yield* Effect.annotateCurrentSpan("messageId", messageId)
			return client.message.getOrCreate([messageId], {
				params: { token: config.botToken },
			})
		})

		return {
			getMessageActor,
			client,
			botToken: config.botToken,
		}
	}),
}) {}
