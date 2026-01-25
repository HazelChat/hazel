import { InternalServerError, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import {
	DiscordApiError,
	DiscordChannel,
	DiscordChannelsResponse,
	DiscordGuild,
	DiscordGuildsResponse,
	DiscordNotConnectedError,
	DiscordRpcs,
} from "@hazel/domain/rpc"
import { Discord } from "@hazel/integrations"
import { Effect, Option } from "effect"
import { DiscordPolicy } from "../../policies/discord-policy"
import { IntegrationConnectionRepo } from "../../repositories/integration-connection-repo"

/**
 * Discord RPC Handlers
 *
 * Implements the business logic for Discord integration RPC methods.
 * Uses the bot token for all Discord API calls (not user OAuth tokens).
 */
export const DiscordRpcLive = DiscordRpcs.toLayer(
	Effect.gen(function* () {
		const connectionRepo = yield* IntegrationConnectionRepo

		return {
			"discord.listGuilds": ({ organizationId }) =>
				Effect.gen(function* () {
					// Check if Discord is connected for this organization
					const connectionOption = yield* connectionRepo
						.findOrgConnection(organizationId, "discord")
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(new DiscordNotConnectedError({ organizationId }))
					}

					// Get all guilds the bot has access to via Discord API
					const discordClient = yield* Discord.DiscordApiClient
					const guilds = yield* discordClient.getBotGuilds().pipe(
						Effect.mapError(
							(err) =>
								new DiscordApiError({
									message: err.message,
								}),
						),
					)

					return new DiscordGuildsResponse({
						guilds: guilds.map(
							(g) =>
								new DiscordGuild({
									id: g.id,
									name: g.name,
									icon: g.icon,
									memberCount: g.approximate_member_count,
								}),
						),
					})
				}).pipe(
					policyUse(DiscordPolicy.canListGuilds(organizationId)),
					Effect.provide(Discord.DiscordApiClient.Default),
					withRemapDbErrors("Discord", "select"),
					Effect.catchTag("ConfigError", (err) =>
						Effect.fail(
							new InternalServerError({
								message: "Discord configuration error",
								cause: String(err),
							}),
						),
					),
				),

			"discord.listChannels": ({ organizationId, guildId }) =>
				Effect.gen(function* () {
					// Check if Discord is connected for this organization
					const connectionOption = yield* connectionRepo
						.findOrgConnection(organizationId, "discord")
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(new DiscordNotConnectedError({ organizationId }))
					}

					// Get channels for the guild via Discord API
					const discordClient = yield* Discord.DiscordApiClient
					const channels = yield* discordClient.getGuildChannels(guildId).pipe(
						Effect.mapError(
							(err) =>
								new DiscordApiError({
									message: err.message,
								}),
						),
					)

					return new DiscordChannelsResponse({
						channels: channels.map(
							(c) =>
								new DiscordChannel({
									id: c.id,
									name: c.name ?? "unknown",
									type: c.type,
									parentId: c.parent_id ?? null,
								}),
						),
					})
				}).pipe(
					policyUse(DiscordPolicy.canListChannels(organizationId)),
					Effect.provide(Discord.DiscordApiClient.Default),
					withRemapDbErrors("Discord", "select"),
					Effect.catchTag("ConfigError", (err) =>
						Effect.fail(
							new InternalServerError({
								message: "Discord configuration error",
								cause: String(err),
							}),
						),
					),
				),

			"discord.createWebhook": ({ organizationId, channelId }) =>
				Effect.gen(function* () {
					// Check if Discord is connected for this organization
					const connectionOption = yield* connectionRepo
						.findOrgConnection(organizationId, "discord")
						.pipe(withSystemActor)

					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(new DiscordNotConnectedError({ organizationId }))
					}

					// Create webhook in the Discord channel
					const discordClient = yield* Discord.DiscordApiClient
					const webhook = yield* discordClient.createWebhook(channelId, "Hazel Bridge").pipe(
						Effect.mapError(
							(err) =>
								new DiscordApiError({
									message: err.message,
								}),
						),
					)

					// Construct webhook URL if not provided
					const webhookUrl =
						webhook.url ?? `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`

					return {
						webhookId: webhook.id,
						webhookUrl,
					}
				}).pipe(
					policyUse(DiscordPolicy.canCreateWebhook(organizationId)),
					Effect.provide(Discord.DiscordApiClient.Default),
					withRemapDbErrors("Discord", "create"),
					Effect.catchTag("ConfigError", (err) =>
						Effect.fail(
							new InternalServerError({
								message: "Discord configuration error",
								cause: String(err),
							}),
						),
					),
				),
		}
	}),
)
