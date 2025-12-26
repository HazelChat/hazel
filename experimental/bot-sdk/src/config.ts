import { Schema } from "effect"
import type { EventDispatcherConfig, EventQueueConfig, ShapeSubscriptionConfig } from "./services/index.ts"

/**
 * Bot client runtime configuration
 * Note: subscriptions are passed separately since they contain runtime Schema values
 */
export interface BotConfig {
	readonly electricUrl: string
	readonly botToken: string
	readonly subscriptions?: readonly ShapeSubscriptionConfig[]
	readonly queueConfig?: EventQueueConfig
	readonly dispatcherConfig?: EventDispatcherConfig
}

/**
 * Default queue configuration
 */
export const defaultQueueConfig: EventQueueConfig = {
	capacity: 1000,
	backpressureStrategy: "sliding",
}

/**
 * Default dispatcher configuration
 */
export const defaultDispatcherConfig: EventDispatcherConfig = {
	maxRetries: 3,
	retryBaseDelay: 100,
}
