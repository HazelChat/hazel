import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { OrganizationId } from "../ids"
import { AuthMiddleware } from "./middleware"

/**
 * Discord guild (server) information.
 */
export class DiscordGuild extends Schema.Class<DiscordGuild>("DiscordGuild")({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.NullOr(Schema.String),
	memberCount: Schema.optional(Schema.Number),
}) {}

/**
 * Discord channel information.
 */
export class DiscordChannel extends Schema.Class<DiscordChannel>("DiscordChannel")({
	id: Schema.String,
	name: Schema.String,
	type: Schema.Number, // 0 = text, 2 = voice, etc.
	parentId: Schema.NullOr(Schema.String), // Category ID
}) {}

/**
 * Response for listing Discord guilds.
 */
export class DiscordGuildsResponse extends Schema.Class<DiscordGuildsResponse>("DiscordGuildsResponse")({
	guilds: Schema.Array(DiscordGuild),
}) {}

/**
 * Response for listing Discord channels.
 */
export class DiscordChannelsResponse extends Schema.Class<DiscordChannelsResponse>("DiscordChannelsResponse")(
	{
		channels: Schema.Array(DiscordChannel),
	},
) {}

/**
 * Error when Discord integration is not connected.
 */
export class DiscordNotConnectedError extends Schema.TaggedError<DiscordNotConnectedError>()(
	"DiscordNotConnectedError",
	{
		organizationId: OrganizationId,
	},
) {}

/**
 * Error when Discord API fails.
 */
export class DiscordApiError extends Schema.TaggedError<DiscordApiError>()("DiscordApiError", {
	message: Schema.String,
	statusCode: Schema.optional(Schema.Number),
}) {}

export class DiscordRpcs extends RpcGroup.make(
	/**
	 * List Discord guilds (servers) the bot has access to.
	 */
	Rpc.query("discord.listGuilds", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
		}),
		success: DiscordGuildsResponse,
		error: Schema.Union(
			DiscordNotConnectedError,
			DiscordApiError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * List Discord channels in a guild.
	 */
	Rpc.query("discord.listChannels", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
			guildId: Schema.String,
		}),
		success: DiscordChannelsResponse,
		error: Schema.Union(
			DiscordNotConnectedError,
			DiscordApiError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * Create a webhook in a Discord channel for outbound messages.
	 * Returns the webhook URL that Hazel will use to send messages to Discord.
	 */
	Rpc.mutation("discord.createWebhook", {
		payload: Schema.Struct({
			organizationId: OrganizationId,
			guildId: Schema.String,
			channelId: Schema.String,
		}),
		success: Schema.Struct({
			webhookId: Schema.String,
			webhookUrl: Schema.String,
		}),
		error: Schema.Union(
			DiscordNotConnectedError,
			DiscordApiError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),
) {}
