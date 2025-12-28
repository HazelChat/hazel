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

// Railway event configuration with colors and labels
const RAILWAY_EVENT_CONFIG: Record<string, { color: number; label: string }> = {
	// Deployment success states
	deployed: { color: 0x10b981, label: "Deployed" },
	redeployed: { color: 0x10b981, label: "Redeployed" },
	success: { color: 0x10b981, label: "Success" },
	succeeded: { color: 0x10b981, label: "Succeeded" },
	completed: { color: 0x10b981, label: "Completed" },

	// Deployment error states
	crashed: { color: 0xef4444, label: "Crashed" },
	oomkilled: { color: 0xef4444, label: "OOM Killed" },
	failed: { color: 0xef4444, label: "Failed" },
	error: { color: 0xef4444, label: "Error" },

	// Deployment progress states
	building: { color: 0x3b82f6, label: "Building" },
	deploying: { color: 0x3b82f6, label: "Deploying" },
	restarted: { color: 0x3b82f6, label: "Restarted" },
	resumed: { color: 0x3b82f6, label: "Resumed" },
	started: { color: 0x3b82f6, label: "Started" },

	// Deployment pending states
	queued: { color: 0x6366f1, label: "Queued" },
	waiting: { color: 0x6366f1, label: "Waiting" },
	needsapproval: { color: 0xf59e0b, label: "Needs Approval" },
	pending: { color: 0x6366f1, label: "Pending" },

	// Deployment neutral states
	removed: { color: 0x6b7280, label: "Removed" },
	slept: { color: 0x6b7280, label: "Slept" },
	deleted: { color: 0x6b7280, label: "Deleted" },
	cancelled: { color: 0x6b7280, label: "Cancelled" },

	// Monitor/Alert states
	triggered: { color: 0xf59e0b, label: "Triggered" },
	resolved: { color: 0x10b981, label: "Resolved" },
	recovered: { color: 0x10b981, label: "Recovered" },
	degraded: { color: 0xf59e0b, label: "Degraded" },
	warning: { color: 0xf59e0b, label: "Warning" },
} as const

// Default config for unknown events
const DEFAULT_EVENT_CONFIG = { color: 0x3b82f6, label: "Unknown" }

// Get Railway event config based on action
function getRailwayEventConfig(action: string, severity?: string): { color: number; label: string } {
	// Normalize action: handle camelCase (oomKilled -> oomkilled)
	const lowerAction = action.toLowerCase().replace(/[^a-z]/g, "")
	if (lowerAction in RAILWAY_EVENT_CONFIG) {
		return RAILWAY_EVENT_CONFIG[lowerAction as keyof typeof RAILWAY_EVENT_CONFIG]
	}
	// Fall back to severity-based config
	if (severity) {
		const lowerSeverity = severity.toLowerCase()
		if (lowerSeverity === "error" || lowerSeverity === "critical") {
			return { color: 0xef4444, label: action }
		}
		if (lowerSeverity === "warning") {
			return { color: 0xf59e0b, label: action }
		}
	}
	// Default for unknown events
	return { ...DEFAULT_EVENT_CONFIG, label: action }
}

// Get event category prefix from type (e.g., "Deployment", "Monitor", "VolumeAlert")
function getEventCategory(eventType: string): string {
	const [category] = eventType.split(".")
	// Format VolumeAlert -> "Volume Alert"
	return category?.replace(/([A-Z])/g, " $1").trim() ?? "Event"
}

// Build the Railway embed from the payload
function buildRailwayEmbed(payload: RailwayPayload): DbMessageEmbed {
	const { type, details, resource, severity, timestamp } = payload
	const railwayConfig = Integrations.WEBHOOK_BOT_CONFIGS.railway

	// Parse event type (e.g., "Deployment.failed" -> ["Deployment", "failed"])
	const [category, action] = type.split(".")
	const eventConfig = getRailwayEventConfig(action ?? type, severity)
	const eventCategory = getEventCategory(type)

	// Build service/project info
	const serviceName = resource.service?.name ?? "Unknown Service"
	const projectName = resource.project.name
	const envName = resource.environment?.name

	// Title: Service name in project
	const title = `${serviceName} in ${projectName}`

	// Description: environment or category context
	const description = envName
		? `Environment: **${envName}**`
		: category !== "Deployment"
			? `${eventCategory}`
			: undefined

	// Badge: Status indicator (e.g., "Deployed", "Crashed")
	const badge = {
		text: eventConfig.label,
		color: eventConfig.color,
	}

	// Build fields based on available data
	const fields: Array<{ name: string; value: string; inline?: boolean }> = []

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
		const commitValue = details.commitMessage
			? `\`${shortHash}\` - ${details.commitMessage}`
			: `\`${shortHash}\``
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
		color: eventConfig.color,
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
		badge,
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
						liveObjectId: null,
						liveObjectType: null,
						liveObjectStatus: null,
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
						liveObjectId: null,
						liveObjectType: null,
						liveObjectStatus: null,
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
				const botUser = yield* botService.getOrCreateWebhookBotUser("railway", webhook.organizationId)

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
						liveObjectId: null,
						liveObjectType: null,
						liveObjectStatus: null,
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
