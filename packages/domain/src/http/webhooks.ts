import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { ChannelId, MessageId, MessageReactionId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { InternalServerError, WorkflowInitializationError } from "../errors"

// WorkOS Webhook Types
export class WorkOSWebhookPayload extends Schema.Class<WorkOSWebhookPayload>("WorkOSWebhookPayload")({
	event: Schema.String,
	data: Schema.Unknown,
	id: Schema.String,
	created_at: Schema.String,
}) {}

export class WebhookResponse extends Schema.Class<WebhookResponse>("WebhookResponse")({
	success: Schema.Boolean,
	message: Schema.optional(Schema.String),
}) {}

export class InvalidWebhookSignature extends Schema.TaggedError<InvalidWebhookSignature>(
	"InvalidWebhookSignature",
)(
	"InvalidWebhookSignature",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 401,
	}),
) {}

// Sequin Stream Webhook Types
export class SequinMessageRecord extends Schema.Class<SequinMessageRecord>("SequinMessageRecord")({
	id: MessageId,
	channelId: ChannelId,
	authorId: UserId,
	content: Schema.String,
	replyToMessageId: Schema.NullOr(MessageId),
	threadChannelId: Schema.NullOr(ChannelId),
	createdAt: Schema.String, // ISO timestamp from Sequin
	updatedAt: Schema.NullOr(Schema.String),
	deletedAt: Schema.NullOr(Schema.String),
}) {}

export class SequinMessageReactionRecord extends Schema.Class<SequinMessageReactionRecord>(
	"SequinMessageReactionRecord",
)({
	id: MessageReactionId,
	messageId: MessageId,
	channelId: ChannelId,
	userId: UserId,
	emoji: Schema.String,
	createdAt: Schema.String,
	updatedAt: Schema.NullOr(Schema.String),
}) {}

export class SequinConsumer extends Schema.Class<SequinConsumer>("SequinConsumer")({
	id: Schema.String,
	name: Schema.String,
	annotations: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
}) {}

export class SequinDatabase extends Schema.Class<SequinDatabase>("SequinDatabase")({
	id: Schema.String,
	name: Schema.String,
	hostname: Schema.String,
	database: Schema.String,
	annotations: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
}) {}

export class SequinMetadata extends Schema.Class<SequinMetadata>("SequinMetadata")({
	idempotency_key: Schema.String,
	commit_lsn: Schema.Number,
	commit_idx: Schema.Number,
	record_pks: Schema.Array(Schema.String),
	commit_timestamp: Schema.String,
	table_name: Schema.String,
	table_schema: Schema.String,
	database_name: Schema.String,
	transaction_annotations: Schema.NullOr(Schema.Unknown),
	enrichment: Schema.NullOr(Schema.Unknown),
	consumer: SequinConsumer,
	database: SequinDatabase,
}) {}

export const SequinAction = Schema.Literal("insert", "update", "delete")

export const SequinWebhookRecordSchema = Schema.Union(
	SequinMessageRecord,
	SequinMessageReactionRecord,
)
export type SequinWebhookRecord = Schema.Schema.Type<typeof SequinWebhookRecordSchema>

// Individual event in the webhook data array
export class SequinWebhookEvent extends Schema.Class<SequinWebhookEvent>("SequinWebhookEvent")({
	record: SequinWebhookRecordSchema,
	metadata: SequinMetadata,
	action: SequinAction,
	changes: Schema.NullOr(Schema.Unknown),
}) {}

// Sequin webhook payload wraps events in a data array
export class SequinWebhookPayload extends Schema.Class<SequinWebhookPayload>("SequinWebhookPayload")({
	data: Schema.Array(SequinWebhookEvent),
}) {}

// GitHub Webhook Types
export class GitHubWebhookResponse extends Schema.Class<GitHubWebhookResponse>("GitHubWebhookResponse")({
	processed: Schema.Boolean,
	messagesCreated: Schema.optional(Schema.Number),
}) {}

export class InvalidGitHubWebhookSignature extends Schema.TaggedError<InvalidGitHubWebhookSignature>(
	"InvalidGitHubWebhookSignature",
)(
	"InvalidGitHubWebhookSignature",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 401,
	}),
) {}

export class WebhookGroup extends HttpApiGroup.make("webhooks")
	.add(
		HttpApiEndpoint.post("workos")`/workos`
			.setPayload(Schema.Unknown)
			.addSuccess(WebhookResponse)
			.addError(InvalidWebhookSignature)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "WorkOS Webhook",
					description: "Receive and process WorkOS webhook events",
					summary: "Process WorkOS webhook events",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("sequinWebhook")`/sequin/message-notification`
			.setPayload(SequinWebhookPayload)
			.addSuccess(Schema.Void, { status: 204 })
			.addError(InternalServerError)
			.addError(WorkflowInitializationError)
			.annotateContext(
				OpenApi.annotations({
					title: "Sequin Stream Webhook - Message Notifications",
					description:
						"Receive message insert events from Sequin Stream to trigger notification workflows",
					summary: "Process Sequin message insert events",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("github")`/github`
			.setPayload(Schema.Unknown)
			.addSuccess(GitHubWebhookResponse)
			.addError(InvalidGitHubWebhookSignature)
			.addError(InternalServerError)
			.addError(WorkflowInitializationError)
			.annotateContext(
				OpenApi.annotations({
					title: "GitHub App Webhook",
					description: "Receive and process GitHub App webhook events",
					summary: "Process GitHub App webhook events",
				}),
			),
	)
	.prefix("/webhooks") {}
