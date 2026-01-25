import { ChannelId, ExternalChannelLinkId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { IntegrationProvider } from "./integration-connection-model"
import * as M from "./utils"
import { baseFields, JsonDate } from "./utils"

export const SyncDirection = Schema.Literal("inbound", "outbound", "bidirectional")
export type SyncDirection = Schema.Schema.Type<typeof SyncDirection>

// Discord-specific config
export const DiscordChannelConfig = Schema.Struct({
	provider: Schema.Literal("discord"),
	outboundWebhookUrl: Schema.optional(Schema.String),
	outboundWebhookId: Schema.optional(Schema.String),
})

// Slack-specific config
export const SlackChannelConfig = Schema.Struct({
	provider: Schema.Literal("slack"),
	outboundWebhookUrl: Schema.optional(Schema.String),
	botToken: Schema.optional(Schema.String),
})

export const ExternalChannelConfig = Schema.Union(DiscordChannelConfig, SlackChannelConfig)
export type ExternalChannelConfig = Schema.Schema.Type<typeof ExternalChannelConfig>

export class Model extends M.Class<Model>("ExternalChannelLink")({
	id: M.Generated(ExternalChannelLinkId),

	// Hazel side
	channelId: ChannelId,
	organizationId: OrganizationId,

	// External side
	provider: IntegrationProvider,
	externalWorkspaceId: Schema.String,
	externalWorkspaceName: Schema.String,
	externalChannelId: Schema.String,
	externalChannelName: Schema.String,

	// Sync config
	syncDirection: SyncDirection,

	// Provider-specific config
	config: Schema.NullOr(ExternalChannelConfig),

	isEnabled: Schema.Boolean,
	createdBy: UserId,
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
