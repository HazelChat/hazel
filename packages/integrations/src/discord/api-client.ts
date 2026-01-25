import { FetchHttpClient, HttpBody, HttpClient, HttpClientRequest } from "@effect/platform"
import { Config, Effect, Redacted, Schema } from "effect"

/**
 * Discord Guild (Server) schema
 */
const DiscordGuild = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.NullOr(Schema.String),
	owner_id: Schema.optional(Schema.String),
})

/**
 * Discord Channel schema
 */
const DiscordChannel = Schema.Struct({
	id: Schema.String,
	name: Schema.optional(Schema.String),
	type: Schema.Number,
	guild_id: Schema.optional(Schema.String),
	position: Schema.optional(Schema.Number),
	parent_id: Schema.optional(Schema.NullOr(Schema.String)),
})

/**
 * Discord API Client for bot operations.
 * Uses the Bot Token for authentication.
 */
export class DiscordApiClient extends Effect.Service<DiscordApiClient>()("DiscordApiClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const botToken = yield* Config.redacted("DISCORD_BOT_TOKEN")
		const httpClient = yield* HttpClient.HttpClient

		const makeAuthenticatedClient = () =>
			httpClient.pipe(
				HttpClient.mapRequest(HttpClientRequest.prependUrl("https://discord.com/api/v10")),
				HttpClient.mapRequest(
					HttpClientRequest.setHeader("Authorization", `Bot ${Redacted.value(botToken)}`),
				),
			)

		/**
		 * Get guild (server) information by ID.
		 */
		const getGuild = (guildId: string) =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient()
				const response = yield* client.get(`/guilds/${guildId}`).pipe(Effect.scoped)

				if (response.status >= 400) {
					return yield* Effect.fail(new Error(`Discord API error: ${response.status}`))
				}

				const json = yield* response.json
				return yield* Schema.decodeUnknown(DiscordGuild)(json)
			})

		/**
		 * Get channels in a guild.
		 * Returns only text channels (type 0).
		 */
		const getGuildChannels = (guildId: string) =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient()
				const response = yield* client.get(`/guilds/${guildId}/channels`).pipe(Effect.scoped)

				if (response.status >= 400) {
					return yield* Effect.fail(new Error(`Discord API error: ${response.status}`))
				}

				const json = yield* response.json
				const channels = yield* Schema.decodeUnknown(Schema.Array(DiscordChannel))(json)
				return channels.filter((ch) => ch.type === 0) // Text channels only
			})

		/**
		 * Get account info for OAuth integration storage.
		 * For bot OAuth, this gets the guild info after the bot is added.
		 */
		const getAccountInfo = (guildId: string) =>
			Effect.gen(function* () {
				const guild = yield* getGuild(guildId)

				return {
					externalAccountId: guild.id,
					externalAccountName: guild.name,
				}
			})

		/**
		 * Send a message to a Discord channel.
		 */
		const sendMessage = (channelId: string, content: string, options?: { embeds?: unknown[] }) =>
			Effect.gen(function* () {
				const client = makeAuthenticatedClient()
				const body = JSON.stringify({
					content,
					embeds: options?.embeds,
				})

				const response = yield* client
					.post(`/channels/${channelId}/messages`, {
						body: HttpBody.text(body, "application/json"),
					})
					.pipe(Effect.scoped)

				if (response.status >= 400) {
					return yield* Effect.fail(new Error(`Discord API error: ${response.status}`))
				}

				return yield* response.json
			})

		return {
			getGuild,
			getGuildChannels,
			getAccountInfo,
			sendMessage,
		}
	}),
	dependencies: [FetchHttpClient.layer],
}) {}
