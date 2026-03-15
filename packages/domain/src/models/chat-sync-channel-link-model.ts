import { ChannelId, ExternalChannelId, SyncChannelLinkId, SyncConnectionId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ChatSyncDirection = Schema.Literals(["both", "hazel_to_external", "external_to_hazel"])
export type ChatSyncDirection = Schema.Schema.Type<typeof ChatSyncDirection>

export const ChatSyncOutboundIdentityStrategy = Schema.Literals(["webhook", "fallback_bot"])
export type ChatSyncOutboundIdentityStrategy = Schema.Schema.Type<typeof ChatSyncOutboundIdentityStrategy>

export const DiscordWebhookOutboundIdentityConfig = Schema.Struct({
	kind: Schema.Literal("discord.webhook"),
	webhookId: Schema.NonEmptyString,
	webhookToken: Schema.NonEmptyString,
	defaultAvatarUrl: Schema.optional(Schema.NonEmptyString),
})
export type DiscordWebhookOutboundIdentityConfig = Schema.Schema.Type<
	typeof DiscordWebhookOutboundIdentityConfig
>

export const SlackWebhookOutboundIdentityConfig = Schema.Struct({
	kind: Schema.Literal("slack.webhook"),
	webhookUrl: Schema.NonEmptyString,
	defaultIconUrl: Schema.optional(Schema.NonEmptyString),
})
export type SlackWebhookOutboundIdentityConfig = Schema.Schema.Type<typeof SlackWebhookOutboundIdentityConfig>

export const ProviderOutboundConfig = Schema.Union([
	DiscordWebhookOutboundIdentityConfig,
	SlackWebhookOutboundIdentityConfig,
	Schema.Struct({
		kind: Schema.NonEmptyString,
	}),
])
export type ProviderOutboundConfig = Schema.Schema.Type<typeof ProviderOutboundConfig>

export const OutboundIdentityProviders = Schema.Record(Schema.String, ProviderOutboundConfig)

export const OutboundIdentitySettings = Schema.Struct({
	enabled: Schema.Boolean,
	strategy: ChatSyncOutboundIdentityStrategy,
	providers: OutboundIdentityProviders,
})
export type OutboundIdentitySettings = Schema.Schema.Type<typeof OutboundIdentitySettings>

export class Model extends M.Class<Model>("ChatSyncChannelLink")({
	id: M.Generated(SyncChannelLinkId),
	syncConnectionId: SyncConnectionId,
	hazelChannelId: ChannelId,
	externalChannelId: ExternalChannelId,
	externalChannelName: Schema.NullOr(Schema.String),
	direction: ChatSyncDirection,
	isActive: Schema.Boolean,
	settings: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
	lastSyncedAt: Schema.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
