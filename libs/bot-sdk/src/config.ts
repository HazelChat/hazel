import type { EventDispatcherConfig, EventQueueConfig, ShapeSubscriptionConfig } from "./services/index.ts"
import type { GatewaySessionStore, GatewayTransport } from "./gateway.ts"

/**
 * Bot client runtime configuration
 * Note: subscriptions are passed separately since they contain runtime Schema values
 */
export interface BotConfig {
	readonly electricUrl: string
	readonly backendUrl: string
	readonly botToken: string
	readonly subscriptions?: readonly ShapeSubscriptionConfig[]
	readonly queueConfig?: EventQueueConfig
	readonly dispatcherConfig?: EventDispatcherConfig
	readonly gatewayUrl?: string
	readonly gatewayTransport?: GatewayTransport
	readonly resumeOffset?: string
	readonly sessionStore?: GatewaySessionStore
	readonly maxConcurrentPartitions?: number
	/** Service name for tracing (defaults to "bot") */
	readonly serviceName?: string
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
