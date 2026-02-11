/**
 * Bot Environment Configuration
 *
 * Type-safe configuration from environment variables using Effect's Config module.
 * Provides automatic validation and helpful error messages.
 */

import { Config } from "effect"

const DEFAULT_ACTORS_URL =
	"https://hazel-d9c8-production-e8b3:pk_UecfBPkebh46hBcaDkKrAWD6ot3SPvDsB4ybSlOVtf3p8z6EKQiyaOWPLkUqUBBT@api.rivet.dev"

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
		Config.withDefault("https://electric.hazel.sh/bot/v1/shape"),
		Config.withDescription("Electric SQL proxy URL"),
	),
	backendUrl: Config.string("BACKEND_URL").pipe(
		Config.withDefault("https://api.hazel.sh"),
		Config.withDescription("Backend API URL (also used for SSE command streaming)"),
	),
	actorsUrl: Config.string("ACTORS_URL").pipe(
		Config.orElse(() => Config.string("RIVET_PUBLIC_ENDPOINT")),
		Config.orElse(() => Config.string("RIVET_URL")),
		Config.withDefault(DEFAULT_ACTORS_URL),
		Config.withDescription("Actors/Rivet endpoint for live state streaming"),
	),
	healthPort: Config.number("PORT").pipe(
		Config.withDefault(0),
		Config.withDescription("Health check server port (default 0, OS-assigned)"),
	),
})

export type BotEnvConfig = Config.Config.Success<typeof BotEnvConfig>
