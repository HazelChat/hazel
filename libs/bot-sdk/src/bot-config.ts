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
 * - BACKEND_URL (optional) - Backend API URL for short request/response bot APIs
 * - GATEWAY_URL (optional) - Gateway URL for inbound bot websocket delivery
 */
export const BotEnvConfig = Config.all({
	botToken: Config.redacted("BOT_TOKEN").pipe(Config.withDescription("Bot authentication token")),
	backendUrl: Config.string("BACKEND_URL").pipe(
		Config.withDefault("https://api.hazel.sh"),
		Config.withDescription("Backend API URL"),
	),
	gatewayUrl: Config.string("GATEWAY_URL").pipe(
		Config.orElse(() => Config.string("BACKEND_URL")),
		Config.withDefault("https://api.hazel.sh"),
		Config.withDescription("Gateway API URL for inbound bot websocket delivery"),
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
