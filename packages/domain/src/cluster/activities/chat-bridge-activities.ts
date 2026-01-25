import { ChannelId, ExternalChannelLinkId, MessageId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { IntegrationProvider } from "../../models/integration-connection-model.ts"

// ============================================================================
// Inbound Activity Schemas
// ============================================================================

// External channel link info needed for bridging
export const ExternalChannelLinkInfo = Schema.Struct({
	id: ExternalChannelLinkId,
	channelId: ChannelId,
	organizationId: Schema.String,
	provider: IntegrationProvider,
	syncDirection: Schema.Literal("inbound", "outbound", "bidirectional"),
	isEnabled: Schema.Boolean,
})

export type ExternalChannelLinkInfo = typeof ExternalChannelLinkInfo.Type

// Result of finding linked channels for an external channel
export const FindLinkedChannelsResult = Schema.Struct({
	links: Schema.Array(ExternalChannelLinkInfo),
	count: Schema.Number,
})

export type FindLinkedChannelsResult = typeof FindLinkedChannelsResult.Type

// Result of creating a bridged message in Hazel
export const CreateBridgedMessageResult = Schema.Struct({
	messageId: MessageId,
	channelId: ChannelId,
	authorId: UserId,
})

export type CreateBridgedMessageResult = typeof CreateBridgedMessageResult.Type

// ============================================================================
// Outbound Activity Schemas
// ============================================================================

// Result of sending a message to an external platform
export const SendExternalMessageResult = Schema.Struct({
	externalMessageId: Schema.String,
	provider: IntegrationProvider,
	channelLinkId: ExternalChannelLinkId,
})

export type SendExternalMessageResult = typeof SendExternalMessageResult.Type

// Result of sending to all linked platforms
export const SendToAllLinkedResult = Schema.Struct({
	results: Schema.Array(SendExternalMessageResult),
	successCount: Schema.Number,
	failureCount: Schema.Number,
})

export type SendToAllLinkedResult = typeof SendToAllLinkedResult.Type

// ============================================================================
// Error Types
// ============================================================================

export class FindLinkedChannelsError extends Schema.TaggedError<FindLinkedChannelsError>()(
	"FindLinkedChannelsError",
	{
		provider: IntegrationProvider,
		externalChannelId: Schema.String,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Database errors are transient
}

export class CreateBridgedMessageError extends Schema.TaggedError<CreateBridgedMessageError>()(
	"CreateBridgedMessageError",
	{
		provider: IntegrationProvider,
		externalMessageId: Schema.String,
		channelId: ChannelId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Database errors are transient
}

export class GetBridgedUserError extends Schema.TaggedError<GetBridgedUserError>()("GetBridgedUserError", {
	provider: IntegrationProvider,
	externalAuthorId: Schema.String,
	message: Schema.String,
	cause: Schema.Unknown.pipe(Schema.optional),
}) {
	readonly retryable = true
}

export class SendExternalMessageError extends Schema.TaggedError<SendExternalMessageError>()(
	"SendExternalMessageError",
	{
		provider: IntegrationProvider,
		channelLinkId: ExternalChannelLinkId,
		messageId: MessageId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Network errors are transient
}

export class LoopPreventionError extends Schema.TaggedError<LoopPreventionError>()("LoopPreventionError", {
	messageId: MessageId,
	provider: IntegrationProvider,
	reason: Schema.String,
}) {
	readonly retryable = false // Not an error, just skip
}

// ============================================================================
// Workflow Error Unions
// ============================================================================

export const ChatBridgeInboundWorkflowError = Schema.Union(
	FindLinkedChannelsError,
	CreateBridgedMessageError,
	GetBridgedUserError,
)

export const ChatBridgeOutboundWorkflowError = Schema.Union(
	FindLinkedChannelsError,
	SendExternalMessageError,
	LoopPreventionError,
)
