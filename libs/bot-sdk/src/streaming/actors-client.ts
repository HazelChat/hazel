/**
 * ActorsClient Service
 *
 * Provides an Effect-based wrapper around the RivetKit actors client
 * for interacting with message actors with bot authentication.
 */

import { createActorsClient, type ActorsClient as RivetActorsClient } from "@hazel/actors/client"
import { Context, Effect, Layer } from "effect"

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
	/** The actors endpoint URL */
	readonly endpoint?: string
	/** The bot token for authentication (hzl_bot_xxxxx) */
	readonly botToken: string
}

/**
 * Get the actors endpoint from environment or use default
 */
const getEndpoint = (providedEndpoint?: string): string => {
	if (providedEndpoint) return providedEndpoint
	return (
		process.env.RIVET_PUBLIC_ENDPOINT ?? process.env.RIVET_URL ?? "http://localhost:6420"
	)
}

/**
 * ActorsClient context tag for managing actor connections.
 * Wraps the RivetKit client with Effect patterns and bot authentication.
 */
export class ActorsClient extends Context.Tag("@hazel/bot-sdk/ActorsClient")<
	ActorsClient,
	ActorsClientService
>() {
	/**
	 * Create a layer with bot token and optional endpoint configuration.
	 * The bot token is passed to actors for authentication.
	 * @param config - Configuration with botToken and optional endpoint
	 */
	static readonly layerConfig = (config: ActorsClientConfig): Layer.Layer<ActorsClient> =>
		Layer.sync(ActorsClient, () => {
			const url = getEndpoint(config.endpoint)
			const client = createActorsClient(url)

			return {
				getMessageActor: (messageId: string) =>
					Effect.sync(() =>
						client.message.getOrCreate([messageId], {
							params: { token: config.botToken },
						}),
					),
				client,
				botToken: config.botToken,
			}
		})

	/**
	 * Default layer using environment variables.
	 * Requires BOT_TOKEN environment variable.
	 */
	static readonly Default = Layer.unwrapEffect(
		Effect.gen(function* () {
			const botToken = process.env.BOT_TOKEN
			if (!botToken) {
				return yield* Effect.dieMessage(
					"BOT_TOKEN environment variable is required for ActorsClient",
				)
			}
			return ActorsClient.layerConfig({ botToken })
		}),
	)
}
