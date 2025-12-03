import type { IntegrationConnection } from "../models"

/**
 * Bot configuration for integration providers.
 * Used for displaying bot info in the UI and creating bot users.
 */
export interface IntegrationBotConfig {
	/** Bot display name */
	name: string
	/** Bot avatar URL (Brandfetch CDN) */
	avatarUrl: string
	/** Bot ID prefix for UI identification */
	botId: string
}

/**
 * Shared bot configurations for all integration providers.
 * Single source of truth for bot display info.
 */
export const INTEGRATION_BOT_CONFIGS: Record<
	IntegrationConnection.IntegrationProvider,
	IntegrationBotConfig
> = {
	linear: {
		name: "Linear",
		avatarUrl: "https://cdn.brandfetch.io/linear.app/w/64/h/64/theme/dark/icon",
		botId: "bot-linear",
	},
	github: {
		name: "GitHub",
		avatarUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		botId: "bot-github",
	},
	figma: {
		name: "Figma",
		avatarUrl: "https://cdn.brandfetch.io/figma.com/w/64/h/64/theme/dark/icon",
		botId: "bot-figma",
	},
	notion: {
		name: "Notion",
		avatarUrl: "https://cdn.brandfetch.io/notion.so/w/64/h/64/theme/dark/icon",
		botId: "bot-notion",
	},
}

/**
 * Get bot config for a specific provider
 */
export const getBotConfig = (provider: IntegrationConnection.IntegrationProvider): IntegrationBotConfig =>
	INTEGRATION_BOT_CONFIGS[provider]
