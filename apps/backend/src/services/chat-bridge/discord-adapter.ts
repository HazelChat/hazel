import { FetchHttpClient, HttpBody, HttpClient } from "@effect/platform"
import type { ExternalChannelLink, Message, User } from "@hazel/domain/models"
import { Effect, Schema } from "effect"
import type {
	ChatBridgeAdapter,
	InboundMessage,
	OutboundEmbed,
	OutboundMessage,
	SendMessageResult,
} from "./types"
import { ChatBridgeSendError, ChatBridgeThreadError, ChatBridgeVerificationError } from "./types"

/**
 * Discord webhook message schema.
 */
const DiscordWebhookPayload = Schema.Struct({
	content: Schema.optional(Schema.String),
	username: Schema.optional(Schema.String),
	avatar_url: Schema.optional(Schema.String),
	embeds: Schema.optional(
		Schema.Array(
			Schema.Struct({
				title: Schema.optional(Schema.String),
				description: Schema.optional(Schema.String),
				url: Schema.optional(Schema.String),
				color: Schema.optional(Schema.Number),
				fields: Schema.optional(
					Schema.Array(
						Schema.Struct({
							name: Schema.String,
							value: Schema.String,
							inline: Schema.optional(Schema.Boolean),
						}),
					),
				),
				footer: Schema.optional(
					Schema.Struct({
						text: Schema.String,
						icon_url: Schema.optional(Schema.String),
					}),
				),
				timestamp: Schema.optional(Schema.String),
			}),
		),
	),
	thread_id: Schema.optional(Schema.String),
})

/**
 * Discord webhook response schema.
 */
const DiscordWebhookResponse = Schema.Struct({
	id: Schema.String,
	channel_id: Schema.String,
})

/**
 * Discord Gateway event types we handle.
 */
const DISCORD_EVENT_TYPES = {
	MESSAGE_CREATE: "MESSAGE_CREATE",
	MESSAGE_UPDATE: "MESSAGE_UPDATE",
	MESSAGE_DELETE: "MESSAGE_DELETE",
} as const

/**
 * Discord message payload from Gateway.
 */
interface DiscordMessagePayload {
	id: string
	channel_id: string
	guild_id?: string
	author?: {
		id: string
		username: string
		avatar?: string
	}
	content?: string
	timestamp?: string
	edited_timestamp?: string
	thread?: {
		id: string
		parent_id: string
	}
	message_reference?: {
		message_id: string
		channel_id: string
	}
}

/**
 * Discord Gateway interaction payload.
 */
interface DiscordGatewayPayload {
	t?: string // Event type
	d?: DiscordMessagePayload // Event data
}

/**
 * Create Discord adapter for chat bridge.
 */
export const createDiscordAdapter = (): ChatBridgeAdapter => {
	return {
		provider: "discord",

		/**
		 * Parse Discord Gateway webhook payload.
		 */
		parseInboundPayload(raw: unknown): InboundMessage | null {
			const payload = raw as DiscordGatewayPayload
			const eventType = payload.t
			const data = payload.d

			if (!eventType || !data) {
				return null
			}

			// Skip bot messages to prevent loops
			if (data.author && "bot" in data.author && data.author.bot) {
				return null
			}

			const isEdit = eventType === DISCORD_EVENT_TYPES.MESSAGE_UPDATE
			const isDelete = eventType === DISCORD_EVENT_TYPES.MESSAGE_DELETE

			if (!data.author && !isDelete) {
				return null
			}

			const authorAvatarUrl = data.author?.avatar
				? `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png`
				: undefined

			return {
				externalMessageId: data.id,
				externalChannelId: data.channel_id,
				externalThreadId: data.thread?.id,
				externalParentMessageId: data.message_reference?.message_id,
				authorId: data.author?.id ?? "unknown",
				authorName: data.author?.username ?? "Unknown User",
				authorAvatarUrl,
				content: data.content ?? "",
				timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
				isEdit,
				isDelete,
				rawPayload: raw,
			}
		},

		/**
		 * Format Hazel message for Discord webhook.
		 */
		formatOutboundMessage(
			message: Message.Model,
			author: User.Model,
			_link: ExternalChannelLink.Model,
		): OutboundMessage {
			// Convert Hazel embeds to Discord format
			const embeds: OutboundEmbed[] | undefined = message.embeds
				? message.embeds.map((embed) => ({
						title: embed.title ?? undefined,
						description: embed.description ?? undefined,
						url: embed.url ?? undefined,
						color: embed.color ?? undefined,
						fields: embed.fields?.map((f) => ({
							name: f.name,
							value: f.value,
							inline: f.inline,
						})),
						footer: embed.footer
							? {
									text: embed.footer.text,
									iconUrl: embed.footer.iconUrl ?? undefined,
								}
							: undefined,
						timestamp: embed.timestamp ?? undefined,
					}))
				: undefined

			return {
				content: message.content,
				authorName: `${author.firstName}${author.lastName ? ` ${author.lastName}` : ""} (Hazel)`,
				authorAvatarUrl: author.avatarUrl ?? undefined,
				embeds,
			}
		},

		/**
		 * Send message to Discord via webhook.
		 */
		sendMessage(
			link: ExternalChannelLink.Model,
			payload: OutboundMessage,
		): Effect.Effect<SendMessageResult, ChatBridgeSendError> {
			return Effect.gen(function* () {
				const config = link.config as { provider: "discord"; outboundWebhookUrl?: string } | null
				const webhookUrl = config?.outboundWebhookUrl

				if (!webhookUrl) {
					return yield* Effect.fail(
						new ChatBridgeSendError("discord", "No outbound webhook URL configured"),
					)
				}

				const httpClient = yield* HttpClient.HttpClient

				// Build Discord webhook payload
				const discordPayload = {
					content: payload.content || undefined,
					username: payload.authorName,
					avatar_url: payload.authorAvatarUrl,
					embeds: payload.embeds?.map((e) => ({
						title: e.title,
						description: e.description,
						url: e.url,
						color: e.color,
						fields: e.fields,
						footer: e.footer
							? {
									text: e.footer.text,
									icon_url: e.footer.iconUrl,
								}
							: undefined,
						timestamp: e.timestamp,
					})),
				}

				const response = yield* httpClient
					.post(`${webhookUrl}?wait=true`, {
						headers: {
							"Content-Type": "application/json",
						},
						body: HttpBody.text(JSON.stringify(discordPayload), "application/json"),
					})
					.pipe(
						Effect.scoped,
						Effect.catchAll((error) =>
							Effect.fail(
								new ChatBridgeSendError(
									"discord",
									`HTTP request failed: ${String(error)}`,
									error,
								),
							),
						),
					)

				if (response.status >= 400) {
					const errorText = yield* response.text.pipe(
						Effect.catchTag("ResponseError", () => Effect.succeed("(unable to read body)")),
					)
					return yield* Effect.fail(
						new ChatBridgeSendError(
							"discord",
							`Discord API error: ${response.status} ${errorText}`,
						),
					)
				}

				const jsonResult = yield* response.json.pipe(
					Effect.catchTag("ResponseError", (error) =>
						Effect.fail(
							new ChatBridgeSendError(
								"discord",
								`Failed to read response body: ${String(error)}`,
								error,
							),
						),
					),
				)

				const data = yield* Schema.decodeUnknown(DiscordWebhookResponse)(jsonResult).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new ChatBridgeSendError(
								"discord",
								`Failed to parse Discord response: ${String(error)}`,
								error,
							),
						),
					),
				)

				return {
					externalMessageId: data.id,
				} as SendMessageResult
			}).pipe(Effect.provide(FetchHttpClient.layer))
		},

		/**
		 * Verify Discord webhook signature using Ed25519.
		 */
		verifyWebhookSignature(
			body: string,
			signature: string,
			timestamp: string,
		): Effect.Effect<boolean, ChatBridgeVerificationError> {
			return Effect.gen(function* () {
				// Discord uses Ed25519 signatures
				// The signature is verified against: timestamp + body
				// This requires the Discord public key from environment

				// For now, we'll implement basic verification
				// In production, use nacl/tweetnacl for Ed25519 verification
				if (!signature || !timestamp) {
					return yield* Effect.fail(
						new ChatBridgeVerificationError("discord", "Missing signature or timestamp"),
					)
				}

				// TODO: Implement actual Ed25519 verification with Discord public key
				// For now, return true and implement proper verification later
				return true
			})
		},
	}
}
