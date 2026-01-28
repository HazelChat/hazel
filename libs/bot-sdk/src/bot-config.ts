/**
 * Bot Environment Configuration
 *
 * Type-safe configuration from environment variables using Effect's Config module.
 * Provides automatic validation and helpful error messages.
 */

import { Config } from "effect"

/**
 * Bot environment configuration schema
 *
 * Reads and validates the following environment variables:
 * - BOT_TOKEN (required) - Bot authentication token
 * - ELECTRIC_URL (optional) - Electric SQL proxy URL
 * - BACKEND_URL (optional) - Backend API URL (also used for SSE command streaming)
 */
export const BotEnvConfig = Config.all({
	botToken: Config.redacted("BOT_TOKEN").pipe(Config.withDescription("Bot authentication token")),
	electricUrl: Config.string("ELECTRIC_URL").pipe(
		Config.withDefault("http://localhost:8787/v1/shape"),
		Config.withDescription("Electric SQL proxy URL"),
	),
	backendUrl: Config.string("BACKEND_URL").pipe(
		Config.withDefault("http://localhost:3003"),
		Config.withDescription("Backend API URL (also used for SSE command streaming)"),
	),
})

export type BotEnvConfig = Config.Config.Success<typeof BotEnvConfig>
