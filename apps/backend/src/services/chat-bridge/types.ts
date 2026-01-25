import type { ExternalChannelLink, IntegrationConnection, Message, User } from "@hazel/domain/models"
import type { Effect } from "effect"
import type { Schema } from "effect"

/**
 * Provider types for chat bridge integrations.
 */
export type ChatBridgeProvider = "discord" | "slack"

/**
 * Inbound message from external platform.
 */
export interface InboundMessage {
	externalMessageId: string
	externalChannelId: string
	externalThreadId?: string
	externalParentMessageId?: string
	authorId: string
	authorName: string
	authorAvatarUrl?: string
	content: string
	timestamp: Date
	isEdit?: boolean
	isDelete?: boolean
	// Provider-specific payload for debugging/extension
	rawPayload?: unknown
}

/**
 * Outbound message to external platform.
 */
export interface OutboundMessage {
	content: string
	authorName: string
	authorAvatarUrl?: string
	embeds?: OutboundEmbed[]
	replyToExternalMessageId?: string
}

/**
 * Embed for outbound messages (simplified Discord-style).
 */
export interface OutboundEmbed {
	title?: string
	description?: string
	url?: string
	color?: number
	fields?: { name: string; value: string; inline?: boolean }[]
	footer?: { text: string; iconUrl?: string }
	timestamp?: string
}

/**
 * Result of sending a message to external platform.
 */
export interface SendMessageResult {
	externalMessageId: string
	externalThreadId?: string
}

/**
 * Chat bridge adapter interface.
 * Each provider (Discord, Slack) implements this interface.
 */
export interface ChatBridgeAdapter {
	readonly provider: ChatBridgeProvider

	/**
	 * Parse incoming webhook payload into a normalized inbound message.
	 */
	parseInboundPayload(raw: unknown): InboundMessage | null

	/**
	 * Format a Hazel message for sending to the external platform.
	 */
	formatOutboundMessage(
		message: Message.Model,
		author: User.Model,
		link: ExternalChannelLink.Model,
	): OutboundMessage

	/**
	 * Send a message to the external platform.
	 */
	sendMessage(
		link: ExternalChannelLink.Model,
		payload: OutboundMessage,
	): Effect.Effect<SendMessageResult, ChatBridgeSendError>

	/**
	 * Create a thread on the external platform.
	 */
	createThread?(
		link: ExternalChannelLink.Model,
		parentMessageId: string,
		name: string,
	): Effect.Effect<string, ChatBridgeThreadError>

	/**
	 * Verify the authenticity of an incoming webhook request.
	 */
	verifyWebhookSignature?(
		body: string,
		signature: string,
		timestamp: string,
	): Effect.Effect<boolean, ChatBridgeVerificationError>
}

/**
 * Error when sending a message to external platform fails.
 */
export class ChatBridgeSendError extends Error {
	readonly _tag = "ChatBridgeSendError"
	constructor(
		readonly provider: ChatBridgeProvider,
		readonly message: string,
		readonly cause?: unknown,
	) {
		super(`[${provider}] Failed to send message: ${message}`)
	}
}

/**
 * Error when creating a thread on external platform fails.
 */
export class ChatBridgeThreadError extends Error {
	readonly _tag = "ChatBridgeThreadError"
	constructor(
		readonly provider: ChatBridgeProvider,
		readonly message: string,
		readonly cause?: unknown,
	) {
		super(`[${provider}] Failed to create thread: ${message}`)
	}
}

/**
 * Error when webhook signature verification fails.
 */
export class ChatBridgeVerificationError extends Error {
	readonly _tag = "ChatBridgeVerificationError"
	constructor(
		readonly provider: ChatBridgeProvider,
		readonly message: string,
	) {
		super(`[${provider}] Webhook verification failed: ${message}`)
	}
}

/**
 * Parameters for creating a bridged message in Hazel.
 */
export interface BridgedMessageParams {
	provider: ChatBridgeProvider
	inboundMessage: InboundMessage
	channelLinkId: string
	hazelChannelId: string
	organizationId: string
}
