import { ExternalChannelId, type OrganizationId } from "@hazel/schema"
import { Effect, Schema } from "effect"
import * as AsyncData from "foldkit/asyncData"
import { CommonReason, isRetryableReason, type UserErrorMessage, failureMessage } from "~/lib/error-messages"
import { HazelApiClient } from "../../../rpc"

/** A Discord guild as `AddConnectionModal` lists it. */
export const DiscordGuild = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.NullOr(Schema.String),
	owner: Schema.Boolean,
})
export type DiscordGuild = typeof DiscordGuild.Type

/** A Discord channel as `AddChannelLinkModal` lists it. */
export const DiscordChannel = Schema.Struct({
	id: ExternalChannelId,
	guildId: Schema.String,
	name: Schema.String,
	type: Schema.Number,
	parentId: Schema.NullOr(Schema.String),
})
export type DiscordChannel = typeof DiscordChannel.Type

/**
 * Why a Discord resource list failed: Discord is not authorized for the organization, Discord itself
 * refused (e.g. the bot lacks access), or a common reason.
 */
export const DiscordFailure = Schema.Union([Schema.Literals(["NotConnected", "ProviderError"]), CommonReason])
export type DiscordFailure = typeof DiscordFailure.Type

export const DiscordGuilds = AsyncData.Schema(Schema.Array(DiscordGuild), DiscordFailure)
export const DiscordChannels = AsyncData.Schema(Schema.Array(DiscordChannel), DiscordFailure)

/** `HazelApiClient.query("integration-resources", "getDiscordGuilds", ...)` */
export const fetchDiscordGuilds = (orgId: OrganizationId) =>
	HazelApiClient.use((client) =>
		client["integration-resources"].getDiscordGuilds({ params: { orgId } }),
	).pipe(Effect.map((response): ReadonlyArray<DiscordGuild> => response.guilds))

/** `HazelApiClient.query("integration-resources", "getDiscordGuildChannels", ...)` */
export const fetchDiscordGuildChannels = (orgId: OrganizationId, guildId: string) =>
	HazelApiClient.use((client) =>
		client["integration-resources"].getDiscordGuildChannels({ params: { orgId, guildId } }),
	).pipe(Effect.map((response): ReadonlyArray<DiscordChannel> => response.channels))

const isCommonReason = Schema.is(CommonReason)

/** Whether a failure is transient, so the view offers "Try again". */
export const isRetryable = (reason: string): boolean => isCommonReason(reason) && isRetryableReason(reason)

/** The inline copy for a Discord list (`resource`: "guilds" or "channels") that failed to load. */
export const discordFailureMessage = (reason: DiscordFailure, resource: string): UserErrorMessage =>
	failureMessage(reason, {
		NotConnected: {
			title: "Connect Discord first",
			description: `Authorize Discord in Integrations so we can load your ${resource}.`,
		},
		ProviderError: {
			title: `Could not load Discord ${resource}`,
			description: "Make sure the bot is installed in this server and has channel access.",
		},
	})
