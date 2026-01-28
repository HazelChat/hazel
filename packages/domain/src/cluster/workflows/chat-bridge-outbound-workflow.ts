import { Workflow } from "@effect/workflow"
import { ChannelId, MessageId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { ChatBridgeOutboundWorkflowError } from "../activities/chat-bridge-activities.ts"

/**
 * ChatBridgeOutboundWorkflow
 *
 * Triggered when a message is created/updated/deleted in Hazel.
 * Sends the message to all linked external platforms (Discord, Slack).
 *
 * Flow:
 * 1. Check if message originated from an external platform (loop prevention)
 * 2. Find all external channel links for this Hazel channel
 * 3. For each linked platform, format and send the message
 * 4. Handle thread mapping if applicable
 */
export const ChatBridgeOutboundWorkflow = Workflow.make({
	name: "ChatBridgeOutboundWorkflow",
	payload: {
		// Hazel message identifiers
		messageId: MessageId,
		channelId: ChannelId,
		authorId: UserId,
		eventType: Schema.Literal("create", "update", "delete"),

		// Message content (only for create/update)
		content: Schema.optional(Schema.String),

		// Thread info if applicable
		threadChannelId: Schema.NullOr(ChannelId),
	},
	error: ChatBridgeOutboundWorkflowError,
	// Idempotency: process each Hazel message event only once
	idempotencyKey: (payload) => `outbound-${payload.messageId}-${payload.eventType}`,
})

export type ChatBridgeOutboundWorkflowPayload = Schema.Schema.Type<
	typeof ChatBridgeOutboundWorkflow.payloadSchema
>
