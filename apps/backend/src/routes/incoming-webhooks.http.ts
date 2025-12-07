import { createHash, timingSafeEqual } from "node:crypto"
import { HttpApiBuilder } from "@effect/platform"
import type { MessageEmbed as DbMessageEmbed } from "@hazel/db"
import { Integrations, InternalServerError, withSystemActor } from "@hazel/domain"
import {
	InvalidWebhookTokenError,
	type OpenStatusPayload,
	type RailwayPayload,
	WebhookDisabledError,
	WebhookMessageResponse,
	WebhookNotFoundError,
} from "@hazel/domain/http"
import type { MessageEmbed } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { HazelApi } from "../api"
import { ChannelWebhookRepo } from "../repositories/channel-webhook-repo"
import { MessageRepo } from "../repositories/message-repo"
import { IntegrationBotService } from "../services/integrations/integration-bot-service"

// Convert domain embed schema to database embed format
const convertEmbedToDb = (embed: MessageEmbed.MessageEmbed): DbMessageEmbed => ({
	title: embed.title,
	description: embed.description,
	url: embed.url,
	color: embed.color,
	author: embed.author
		? {
				name: embed.author.name,
				url: embed.author.url,
				iconUrl: embed.author.iconUrl,
			}
		: undefined,
	footer: embed.footer
		? {
				text: embed.footer.text,
				iconUrl: embed.footer.iconUrl,
			}
		: undefined,
	image: embed.image,
	thumbnail: embed.thumbnail,
	fields: embed.fields?.map((f: MessageEmbed.MessageEmbedField) => ({
		name: f.name,
		value: f.value,
		inline: f.inline,
	})),
	timestamp: embed.timestamp,
})

// Status colors using app theme semantic colors
const STATUS_COLORS = {
	recovered: 0x10b981, // Green - success
	error: 0xef4444, // Red - error
	degraded: 0xf59e0b, // Yellow/Orange - warning
} as const

// Status titles
const STATUS_TITLES = {
	recovered: "Monitor Recovered",
	error: "Monitor Down",
	degraded: "Monitor Degraded",
} as const

// Railway event colors based on action type
const RAILWAY_COLORS = {
	// Success states
	success: 0x10b981, // Green
	succeeded: 0x10b981, // Green
	completed: 0x10b981, // Green
	recovered: 0x10b981, // Green
	created: 0x10b981, // Green
	// Error states
	failed: 0xef4444, // Red
	crashed: 0xef4444, // Red
	error: 0xef4444, // Red
	// Warning states
	degraded: 0xf59e0b, // Orange
	warning: 0xf59e0b, // Orange
	triggered: 0xf59e0b, // Orange (for alerts)
	// Info states
	building: 0x3b82f6, // Blue
	deploying: 0x3b82f6, // Blue
	started: 0x3b82f6, // Blue
	pending: 0x6366f1, // Indigo
	// Neutral states
	removed: 0x6b7280, // Gray
	deleted: 0x6b7280, // Gray
	cancelled: 0x6b7280, // Gray
} as const

// Get color for Railway event based on action
function getRailwayColor(action: string, severity?: string): number {
	const lowerAction = action.toLowerCase()
	if (lowerAction in RAILWAY_COLORS) {
		return RAILWAY_COLORS[lowerAction as keyof typeof RAILWAY_COLORS]
	}
	// Fall back to severity-based color
	if (severity) {
		const lowerSeverity = severity.toLowerCase()
		if (lowerSeverity === "error" || lowerSeverity === "critical") return 0xef4444
		if (lowerSeverity === "warning") return 0xf59e0b
	}
	// Default to blue for unknown events
	return 0x3b82f6
}

// Format event type to human-readable title
function formatRailwayEventTitle(eventType: string): string {
	// Split by dot and capitalize each word
	const parts = eventType.split(".")
	return parts
		.map((part) =>
			part
				.replace(/([A-Z])/g, " $1") // Add space before capitals
				.split(/[\s_-]+/) // Split on spaces, underscores, hyphens
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(" ")
				.trim(),
		)
		.join(" ")
}

// Build the Railway embed from the payload
function buildRailwayEmbed(payload: RailwayPayload): DbMessageEmbed {
	const { type, details, resource, severity, timestamp } = payload
	const railwayConfig = Integrations.WEBHOOK_BOT_CONFIGS.railway

	// Parse event type (e.g., "Deployment.failed" -> ["Deployment", "failed"])
	const [, action] = type.split(".")
	const title = formatRailwayEventTitle(type)
	const color = getRailwayColor(action ?? type, severity)

	// Build description
	const serviceName = resource.service?.name ?? "Unknown Service"
	const projectName = resource.project.name
	const description = `**${serviceName}** in ${projectName}`

	// Build fields based on available data
	const fields: Array<{ name: string; value: string; inline?: boolean }> = []

	// Environment (if available)
	if (resource.environment?.name) {
		fields.push({
			name: "Environment",
			value: resource.environment.name,
			inline: true,
		})
	}

	// Branch (if available)
	if (details.branch) {
		fields.push({
			name: "Branch",
			value: details.branch,
			inline: true,
		})
	}

	// Commit info (if available)
	if (details.commitHash) {
		const shortHash = details.commitHash.slice(0, 7)
		const commitValue = details.commitMessage ? `\`${shortHash}\` - ${details.commitMessage}` : `\`${shortHash}\``
		fields.push({
			name: "Commit",
			value: commitValue,
			inline: false,
		})
	}

	// Author (if available)
	if (details.commitAuthor) {
		fields.push({
			name: "Author",
			value: details.commitAuthor,
			inline: true,
		})
	}

	// Source (if available and not already shown)
	if (details.source && details.source !== "GitHub") {
		fields.push({
			name: "Source",
			value: details.source,
			inline: true,
		})
	}

	// Severity (if available and noteworthy)
	if (severity && severity !== "INFO") {
		fields.push({
			name: "Severity",
			value: severity,
			inline: true,
		})
	}

	return {
		title,
		description,
		url: undefined,
		color,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: railwayConfig.avatarUrl,
		},
		footer: {
			text: resource.workspace.name,
			iconUrl: undefined,
		},
		image: undefined,
		thumbnail: undefined,
		fields: fields.length > 0 ? fields : undefined,
		timestamp,
	}
}

// Build the OpenStatus embed from the payload
function buildOpenStatusEmbed(payload: OpenStatusPayload): DbMessageEmbed {
	const { monitor, cronTimestamp, status, statusCode, latency, errorMessage } = payload
	const openStatusConfig = Integrations.WEBHOOK_BOT_CONFIGS.openstatus

	// Build fields based on status
	const fields: Array<{ name: string; value: string; inline?: boolean }> = []

	// Add monitor URL as a field
	fields.push({
		name: "URL",
		value: monitor.url,
		inline: false,
	})

	if (status === "recovered") {
		// Show status code and latency for recovered status
		if (statusCode !== undefined) {
			fields.push({
				name: "Status Code",
				value: String(statusCode),
				inline: true,
			})
		}
		if (latency !== undefined) {
			fields.push({
				name: "Latency",
				value: `${latency}ms`,
				inline: true,
			})
		}
	} else if (status === "error" || status === "degraded") {
		// Show error message for error/degraded status
		if (errorMessage) {
			fields.push({
				name: "Error",
				value: errorMessage,
				inline: false,
			})
		}
	}

	return {
		title: STATUS_TITLES[status],
		description: undefined,
		url: undefined,
		color: STATUS_COLORS[status],
		author: {
			name: monitor.name,
			url: undefined,
			iconUrl: openStatusConfig.avatarUrl,
		},
		footer: undefined,
		image: undefined,
		thumbnail: undefined,
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date(cronTimestamp).toISOString(),
	}
}

export const HttpIncomingWebhookLive = HttpApiBuilder.group(HazelApi, "incoming-webhooks", (handlers) =>
	handlers
		.handle("execute", ({ path, payload }) =>
			Effect.gen(function* () {
				const { webhookId, token } = path
				const webhookRepo = yield* ChannelWebhookRepo
				const messageRepo = yield* MessageRepo

				// Hash the provided token
				const tokenHash = createHash("sha256").update(token).digest("hex")

				// Find webhook by ID
				const webhookOption = yield* webhookRepo.findById(webhookId).pipe(withSystemActor)

				if (Option.isNone(webhookOption)) {
					yield* Effect.logWarning("Webhook not found", { webhookId })
					return yield* Effect.fail(new WebhookNotFoundError({ message: "Webhook not found" }))
				}

				const webhook = webhookOption.value

				// Verify token hash matches using timing-safe comparison to prevent timing attacks
				const tokenBuffer = Buffer.from(tokenHash, "hex")
				const expectedBuffer = Buffer.from(webhook.tokenHash, "hex")
				if (
					tokenBuffer.length !== expectedBuffer.length ||
					!timingSafeEqual(tokenBuffer, expectedBuffer)
				) {
					yield* Effect.logWarning("Invalid webhook token", { webhookId })
					return yield* Effect.fail(
						new InvalidWebhookTokenError({ message: "Invalid webhook token" }),
					)
				}

				// Check if webhook is enabled
				if (!webhook.isEnabled) {
					yield* Effect.logWarning("Webhook is disabled", { webhookId: webhook.id })
					return yield* Effect.fail(new WebhookDisabledError({ message: "Webhook is disabled" }))
				}

				// Validate payload has content or embeds
				if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
					return yield* Effect.fail(
						new InternalServerError({
							message: "Message must have content or embeds",
							detail: "Provide either 'content' or 'embeds' in the payload",
						}),
					)
				}

				// Limit number of embeds (like Discord)
				if (payload.embeds && payload.embeds.length > 10) {
					return yield* Effect.fail(
						new InternalServerError({
							message: "Too many embeds",
							detail: "Maximum 10 embeds per message",
						}),
					)
				}

				// Convert embeds to database format
				const dbEmbeds = payload.embeds?.map(convertEmbedToDb) ?? null

				// Create message as the webhook's bot user
				const [message] = yield* messageRepo
					.insert({
						channelId: webhook.channelId,
						authorId: webhook.botUserId,
						content: payload.content ?? "",
						embeds: dbEmbeds,
						replyToMessageId: null,
						threadChannelId: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				// Update last used timestamp (fire and forget)
				yield* webhookRepo.updateLastUsed(webhook.id).pipe(withSystemActor, Effect.ignore)

				return new WebhookMessageResponse({
					messageId: message.id,
					channelId: webhook.channelId,
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while creating message",
								detail: String(error),
							}),
						),
					ParseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Invalid request data",
								detail: String(error),
							}),
						),
				}),
			),
		)
		.handle("executeOpenStatus", ({ path, payload }) =>
			Effect.gen(function* () {
				const { webhookId, token } = path
				const webhookRepo = yield* ChannelWebhookRepo
				const messageRepo = yield* MessageRepo
				const botService = yield* IntegrationBotService

				// Hash the provided token
				const tokenHash = createHash("sha256").update(token).digest("hex")

				// Find webhook by ID
				const webhookOption = yield* webhookRepo.findById(webhookId).pipe(withSystemActor)

				if (Option.isNone(webhookOption)) {
					yield* Effect.logWarning("Webhook not found", { webhookId })
					return yield* Effect.fail(new WebhookNotFoundError({ message: "Webhook not found" }))
				}

				const webhook = webhookOption.value

				// Verify token hash matches using timing-safe comparison to prevent timing attacks
				const tokenBuffer = Buffer.from(tokenHash, "hex")
				const expectedBuffer = Buffer.from(webhook.tokenHash, "hex")
				if (
					tokenBuffer.length !== expectedBuffer.length ||
					!timingSafeEqual(tokenBuffer, expectedBuffer)
				) {
					yield* Effect.logWarning("Invalid webhook token", { webhookId })
					return yield* Effect.fail(
						new InvalidWebhookTokenError({ message: "Invalid webhook token" }),
					)
				}

				// Check if webhook is enabled
				if (!webhook.isEnabled) {
					yield* Effect.logWarning("Webhook is disabled", { webhookId: webhook.id })
					return yield* Effect.fail(new WebhookDisabledError({ message: "Webhook is disabled" }))
				}

				// Get or create the OpenStatus bot user for this organization
				const botUser = yield* botService.getOrCreateWebhookBotUser(
					"openstatus",
					webhook.organizationId,
				)

				// Build the embed based on status
				const embed = buildOpenStatusEmbed(payload)

				// Create message with the OpenStatus bot as author
				const [message] = yield* messageRepo
					.insert({
						channelId: webhook.channelId,
						authorId: botUser.id,
						content: "",
						embeds: [embed],
						replyToMessageId: null,
						threadChannelId: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				// Update last used timestamp (fire and forget)
				yield* webhookRepo.updateLastUsed(webhook.id).pipe(withSystemActor, Effect.ignore)

				return new WebhookMessageResponse({
					messageId: message.id,
					channelId: webhook.channelId,
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while creating message",
								detail: String(error),
							}),
						),
					ParseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Invalid request data",
								detail: String(error),
							}),
						),
				}),
			),
		)
		.handle("executeRailway", ({ path, payload }) =>
			Effect.gen(function* () {
				const { webhookId, token } = path
				const webhookRepo = yield* ChannelWebhookRepo
				const messageRepo = yield* MessageRepo
				const botService = yield* IntegrationBotService

				// Hash the provided token
				const tokenHash = createHash("sha256").update(token).digest("hex")

				// Find webhook by ID
				const webhookOption = yield* webhookRepo.findById(webhookId).pipe(withSystemActor)

				if (Option.isNone(webhookOption)) {
					yield* Effect.logWarning("Webhook not found", { webhookId })
					return yield* Effect.fail(new WebhookNotFoundError({ message: "Webhook not found" }))
				}

				const webhook = webhookOption.value

				// Verify token hash matches using timing-safe comparison to prevent timing attacks
				const tokenBuffer = Buffer.from(tokenHash, "hex")
				const expectedBuffer = Buffer.from(webhook.tokenHash, "hex")
				if (
					tokenBuffer.length !== expectedBuffer.length ||
					!timingSafeEqual(tokenBuffer, expectedBuffer)
				) {
					yield* Effect.logWarning("Invalid webhook token", { webhookId })
					return yield* Effect.fail(
						new InvalidWebhookTokenError({ message: "Invalid webhook token" }),
					)
				}

				// Check if webhook is enabled
				if (!webhook.isEnabled) {
					yield* Effect.logWarning("Webhook is disabled", { webhookId: webhook.id })
					return yield* Effect.fail(new WebhookDisabledError({ message: "Webhook is disabled" }))
				}

				// Get or create the Railway bot user for this organization
				const botUser = yield* botService.getOrCreateWebhookBotUser(
					"railway",
					webhook.organizationId,
				)

				// Build the embed based on the event
				const embed = buildRailwayEmbed(payload)

				// Create message with the Railway bot as author
				const [message] = yield* messageRepo
					.insert({
						channelId: webhook.channelId,
						authorId: botUser.id,
						content: "",
						embeds: [embed],
						replyToMessageId: null,
						threadChannelId: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				// Update last used timestamp (fire and forget)
				yield* webhookRepo.updateLastUsed(webhook.id).pipe(withSystemActor, Effect.ignore)

				return new WebhookMessageResponse({
					messageId: message.id,
					channelId: webhook.channelId,
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while creating message",
								detail: String(error),
							}),
						),
					ParseError: (error: unknown) =>
						Effect.fail(
							new InternalServerError({
								message: "Invalid request data",
								detail: String(error),
							}),
						),
				}),
			),
		),
)
