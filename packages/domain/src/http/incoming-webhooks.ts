import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { ChannelWebhookId } from "@hazel/schema"
import { Schema } from "effect"
import { InternalServerError } from "../errors"
import { MessageEmbed } from "../models/message-embed-schema"

// Incoming webhook payload (Discord-style)
export class IncomingWebhookPayload extends Schema.Class<IncomingWebhookPayload>("IncomingWebhookPayload")({
	content: Schema.optional(Schema.String), // Plain text content
	embeds: Schema.optional(Schema.Array(MessageEmbed)), // Rich embeds
}) {}

// OpenStatus Monitor schema
export const OpenStatusMonitor = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	url: Schema.String,
})
export type OpenStatusMonitor = Schema.Schema.Type<typeof OpenStatusMonitor>

// OpenStatus status type
export const OpenStatusStatus = Schema.Literal("degraded", "error", "recovered")
export type OpenStatusStatus = Schema.Schema.Type<typeof OpenStatusStatus>

// OpenStatus webhook payload
export class OpenStatusPayload extends Schema.Class<OpenStatusPayload>("OpenStatusPayload")({
	monitor: OpenStatusMonitor,
	cronTimestamp: Schema.Number,
	status: OpenStatusStatus,
	statusCode: Schema.optional(Schema.Number),
	latency: Schema.optional(Schema.Number),
	errorMessage: Schema.optional(Schema.String),
}) {}

// Railway resource schemas
export const RailwayWorkspace = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
})
export type RailwayWorkspace = Schema.Schema.Type<typeof RailwayWorkspace>

export const RailwayProject = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
})
export type RailwayProject = Schema.Schema.Type<typeof RailwayProject>

export const RailwayEnvironment = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	isEphemeral: Schema.optional(Schema.Boolean),
})
export type RailwayEnvironment = Schema.Schema.Type<typeof RailwayEnvironment>

export const RailwayService = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
})
export type RailwayService = Schema.Schema.Type<typeof RailwayService>

export const RailwayDeployment = Schema.Struct({
	id: Schema.String,
})
export type RailwayDeployment = Schema.Schema.Type<typeof RailwayDeployment>

export const RailwayResource = Schema.Struct({
	workspace: RailwayWorkspace,
	project: RailwayProject,
	environment: Schema.optional(RailwayEnvironment),
	service: Schema.optional(RailwayService),
	deployment: Schema.optional(RailwayDeployment),
})
export type RailwayResource = Schema.Schema.Type<typeof RailwayResource>

export const RailwayDetails = Schema.Struct({
	id: Schema.optional(Schema.String),
	source: Schema.optional(Schema.String),
	status: Schema.optional(Schema.String),
	branch: Schema.optional(Schema.String),
	commitHash: Schema.optional(Schema.String),
	commitAuthor: Schema.optional(Schema.String),
	commitMessage: Schema.optional(Schema.String),
})
export type RailwayDetails = Schema.Schema.Type<typeof RailwayDetails>

// Railway webhook payload
export class RailwayPayload extends Schema.Class<RailwayPayload>("RailwayPayload")({
	type: Schema.String, // e.g., "Deployment.failed", "Alert.triggered"
	details: RailwayDetails,
	resource: RailwayResource,
	severity: Schema.optional(Schema.String), // "WARNING", "ERROR", etc.
	timestamp: Schema.String, // ISO 8601 timestamp
}) {}

// Response after successful webhook execution
export class WebhookMessageResponse extends Schema.Class<WebhookMessageResponse>("WebhookMessageResponse")({
	messageId: Schema.String,
	channelId: Schema.String,
}) {}

// Error: Webhook not found
export class WebhookNotFoundError extends Schema.TaggedError<WebhookNotFoundError>()(
	"WebhookNotFoundError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 404 }),
) {}

// Error: Webhook is disabled
export class WebhookDisabledError extends Schema.TaggedError<WebhookDisabledError>()(
	"WebhookDisabledError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 403 }),
) {}

// Error: Invalid webhook token
export class InvalidWebhookTokenError extends Schema.TaggedError<InvalidWebhookTokenError>()(
	"InvalidWebhookTokenError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 401 }),
) {}

// Public endpoint - no auth middleware, uses webhook token in URL
export class IncomingWebhookGroup extends HttpApiGroup.make("incoming-webhooks")
	.add(
		HttpApiEndpoint.post("execute", `/:webhookId/:token`)
			.setPayload(IncomingWebhookPayload)
			.addSuccess(WebhookMessageResponse)
			.addError(WebhookNotFoundError)
			.addError(WebhookDisabledError)
			.addError(InvalidWebhookTokenError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					webhookId: ChannelWebhookId,
					token: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Execute Incoming Webhook",
					description:
						"Post a message to a channel via webhook. Supports plain text content and Discord-style embeds.",
					summary: "Execute webhook to create message",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("executeOpenStatus", `/:webhookId/:token/openstatus`)
			.setPayload(OpenStatusPayload)
			.addSuccess(WebhookMessageResponse)
			.addError(WebhookNotFoundError)
			.addError(WebhookDisabledError)
			.addError(InvalidWebhookTokenError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					webhookId: ChannelWebhookId,
					token: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Execute OpenStatus Webhook",
					description:
						"Receive status alerts from OpenStatus and post them as rich embeds to a channel.",
					summary: "Process OpenStatus alert",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("executeRailway", `/:webhookId/:token/railway`)
			.setPayload(RailwayPayload)
			.addSuccess(WebhookMessageResponse)
			.addError(WebhookNotFoundError)
			.addError(WebhookDisabledError)
			.addError(InvalidWebhookTokenError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					webhookId: ChannelWebhookId,
					token: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Execute Railway Webhook",
					description:
						"Receive deployment and alert events from Railway and post them as rich embeds to a channel.",
					summary: "Process Railway event",
				}),
			),
	)
	.prefix("/webhooks/incoming") {}
