import { Workflow } from "@effect/workflow"
import { Schema } from "effect"
import { IntegrationProvider } from "../../models/integration-connection-model.ts"
import { ChatBridgeInboundWorkflowError } from "../activities/chat-bridge-activities.ts"

/**
 * ChatBridgeInboundWorkflow
 *
 * Triggered when a message is received from an external platform (Discord, Slack).
 * Creates a corresponding message in the linked Hazel channel(s).
 *
 * Flow:
 * 1. Find all Hazel channels linked to the external channel
 * 2. Get or create a machine user for the external author
 * 3. Create the message in each linked Hazel channel
 * 4. Handle thread mapping if applicable
 */
export const ChatBridgeInboundWorkflow = Workflow.make({
	name: "ChatBridgeInboundWorkflow",
	payload: {
		// Provider identification
		provider: IntegrationProvider,
		eventType: Schema.Literal("create", "update", "delete"),

		// External platform identifiers
		externalWorkspaceId: Schema.String,
		externalChannelId: Schema.String,
		externalMessageId: Schema.String,
		externalThreadId: Schema.NullOr(Schema.String),
		externalParentMessageId: Schema.NullOr(Schema.String),

		// Author information
		authorId: Schema.String,
		authorName: Schema.String,
		authorAvatarUrl: Schema.NullOr(Schema.String),

		// Message content
		content: Schema.String,
		timestamp: Schema.DateTimeUtc,

		// Raw payload for provider-specific data (embeds, attachments, etc.)
		rawPayload: Schema.Unknown,
	},
	error: ChatBridgeInboundWorkflowError,
	// Idempotency: process each external message event only once
	idempotencyKey: (payload) =>
		`${payload.provider}-inbound-${payload.externalMessageId}-${payload.eventType}`,
})

export type ChatBridgeInboundWorkflowPayload = Schema.Schema.Type<
	typeof ChatBridgeInboundWorkflow.payloadSchema
>
