import { Config, Effect, Layer, ManagedRuntime, Schema } from "effect"
import { BotAuth, createAuthContextFromToken } from "./auth.ts"
import { BotClient } from "./bot-client.ts"
import type { BotConfig } from "./config.ts"
import { ElectricEventQueue, EventDispatcher, ShapeStreamSubscriber } from "./services/index.ts"

/**
 * Create the full bot runtime from configuration
 */
export const makeBotRuntime = (config: BotConfig) => {
	// Create layers using layerConfig pattern
	const EventQueueLayer = ElectricEventQueue.layerConfig(
		Config.succeed(
			config.queueConfig ?? {
				capacity: 1000,
				backpressureStrategy: "sliding" as const,
			},
		),
	)

	const ShapeSubscriberLayer = ShapeStreamSubscriber.layerConfig(
		Config.succeed({
			electricUrl: config.electricUrl,
			botToken: config.botToken,
			subscriptions: config.subscriptions ?? [],
		}),
	)

	const EventDispatcherLayer = EventDispatcher.layerConfig(
		Config.succeed(
			config.dispatcherConfig ?? {
				maxRetries: 3,
				retryBaseDelay: 100,
			},
		),
	)

	const AuthLayer = Layer.unwrapEffect(
		createAuthContextFromToken(config.botToken).pipe(Effect.map((context) => BotAuth.Default(context))),
	)

	// Manually compose all layers with proper dependency order
	// 1. EventQueue has no dependencies
	// 2. EventDispatcher and ShapeStreamSubscriber need EventQueue
	// 3. BotClient needs EventDispatcher, ShapeStreamSubscriber, and BotAuth
	const AllLayers = BotClient.Default.pipe(
		Layer.provide(
			Layer.mergeAll(
				Layer.provide(EventDispatcherLayer, EventQueueLayer),
				Layer.provide(ShapeSubscriberLayer, EventQueueLayer),
				AuthLayer,
			),
		),
	)

	// Create runtime
	return ManagedRuntime.make(AllLayers)
}

/**
 * Helper to create bot runtime with minimal config
 * Note: You must provide subscriptions with schemas separately
 * @deprecated Use makeBotRuntime with full BotConfig including subscriptions
 */
export const createBotRuntime = (config: BotConfig) => {
	return makeBotRuntime(config)
}
